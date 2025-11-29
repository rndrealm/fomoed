import { useState, useCallback } from "react";
import { SearchResult, VideoFilter, SearchFilter, UploadDate, SortBy } from "./types";

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; expiry: number }>();

function getCached(key: string) {
  const item = cache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any, ttlMinutes: number = 5) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlMinutes * 60 * 1000,
  });
}

export function useYoutubeSearch(widget: any, activeLayout: any, updateWidgetPropsFromAtom: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<SearchFilter>("all");
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");
  const [uploadDate, setUploadDate] = useState<UploadDate>("all");
  const [sortBy, setSortBy] = useState<SortBy>("relevance");

  function dedupe(results: SearchResult[]) {
    const map = new Map<string, SearchResult>();
    results.forEach((item) => map.set(item.id ?? item.channelId, item));
    return [...map.values()];
  }

  const fetchChannels = useCallback(async (query: string): Promise<SearchResult[]> => {
    const cacheKey = `channels:${query}`;
    const cached = getCached(cacheKey);
    if (cached) {
      console.log("✅ Using cached channel results");
      return cached;
    }

    const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!API_KEY) {
      throw new Error("YouTube API key is not configured.");
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=channel&key=${API_KEY}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Search failed");
    }

    const data = await response.json();
    console.log(`📊 Quota used: search.list = 100 units`);

    const channelIds = data.items.map((item: any) => item.id.channelId).join(",");

    if (!channelIds) {
      return [];
    }

    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds}&fields=items(id,snippet(title,description,thumbnails,publishedAt,customUrl),statistics(subscriberCount,videoCount))&key=${API_KEY}`,
    );
    console.log(`📊 Quota used: channels.list = 1 unit`);

    const detailsData = await detailsResponse.json();

    const results: SearchResult[] =
      detailsData.items?.map((item: any) => ({
        id: item.id,
        channelId: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        subscriberCount: item.statistics.subscriberCount,
        videoCount: item.statistics.videoCount,
        type: "channel" as const,
      })) || [];

    setCache(cacheKey, results, 10);
    return results;
  }, []);

  const fetchVideos = useCallback(
    async (
      query: string,
      filter: VideoFilter = "all",
      dateFilter: UploadDate = "all",
      sortFilter: SortBy = "relevance",
    ): Promise<SearchResult[]> => {
      const cacheKey = `videos:${query}:${filter}:${dateFilter}:${sortFilter}`;
      const cached = getCached(cacheKey);
      if (cached) {
        console.log("✅ Using cached video results");
        return cached;
      }

      const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      if (!API_KEY) {
        throw new Error("YouTube API key is not configured.");
      }

      let videoDuration = "";
      let eventType = "";
      const searchType = "video";

      if (filter === "short") {
        videoDuration = "&videoDuration=short";
      } else if (filter === "live") {
        eventType = "&eventType=live";
      } else if (filter === "video") {
        videoDuration = "&videoDuration=medium";
      }

      let publishedAfter = "";
      if (dateFilter === "hour") publishedAfter = `&publishedAfter=${new Date(Date.now() - 3600000).toISOString()}`;
      else if (dateFilter === "today")
        publishedAfter = `&publishedAfter=${new Date(Date.now() - 86400000).toISOString()}`;
      else if (dateFilter === "week")
        publishedAfter = `&publishedAfter=${new Date(Date.now() - 604800000).toISOString()}`;
      else if (dateFilter === "month")
        publishedAfter = `&publishedAfter=${new Date(Date.now() - 2592000000).toISOString()}`;
      else if (dateFilter === "year")
        publishedAfter = `&publishedAfter=${new Date(Date.now() - 31536000000).toISOString()}`;

      const orderParam = sortFilter !== "relevance" ? `&order=${sortFilter}` : "";

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(
          query,
        )}&type=${searchType}${videoDuration}${eventType}${publishedAfter}${orderParam}&key=${API_KEY}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Search failed");
      }

      const data = await response.json();
      console.log(`📊 Quota used: search.list = 100 units`);

      const videoIds = data.items.map((item: any) => item.id.videoId).join(",");

      if (!videoIds) {
        return [];
      }

      const detailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds}&fields=items(id,snippet(title,thumbnails,channelTitle,description,publishedAt,liveBroadcastContent),contentDetails/duration,statistics/viewCount)&key=${API_KEY}`,
      );
      console.log(`📊 Quota used: videos.list = 1 unit`);

      const detailsData = await detailsResponse.json();
      const videoDetails = new Map<
        string,
        {
          duration?: string;
          viewCount?: string;
          isLive?: boolean;
          videoType?: "video" | "short" | "live";
        }
      >(
        detailsData.items?.map((item: any) => {
          const duration = item.contentDetails?.duration;
          const liveBroadcastContent = item.snippet?.liveBroadcastContent;
          const isLive = liveBroadcastContent === "live" || liveBroadcastContent === "upcoming";

          let videoType: "video" | "short" | "live" = "video";
          if (isLive) {
            videoType = "live";
          } else if (duration) {
            const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (match) {
              const hours = match[1] ? parseInt(match[1]) : 0;
              const minutes = match[2] ? parseInt(match[2]) : 0;
              const seconds = match[3] ? parseInt(match[3]) : 0;
              const totalSeconds = hours * 3600 + minutes * 60 + seconds;
              if (totalSeconds <= 60) {
                videoType = "short";
              }
            }
          }

          return [
            item.id,
            {
              duration: item.contentDetails?.duration,
              viewCount: item.statistics?.viewCount,
              isLive,
              videoType,
            },
          ];
        }) || [],
      );

      let results: SearchResult[] = data.items.map((item: any) => {
        const details = videoDetails.get(item.id.videoId);
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
          duration: details?.duration,
          viewCount: details?.viewCount,
          isLive: details?.isLive || false,
          videoType: details?.videoType || "video",
        };
      });

      if (filter === "all") {
        results = results.filter((result) => result.videoType === "video" || result.videoType === "live");
      } else {
        results = results.filter((result) => result.videoType === filter);
      }

      setCache(cacheKey, results, 5);
      return results;
    },
    [],
  );

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const cacheKey = `suggestions:${query}`;
    const cached = getCached(cacheKey);
    if (cached) {
      setSuggestions(cached);
      return;
    }

    try {
      const response = await fetch(`/api/youtube/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        setCache(cacheKey, data.suggestions, 30);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent, overrideQuery?: string) => {
    e.preventDefault();

    const queryToSearch = overrideQuery || searchQuery;
    if (!queryToSearch.trim()) return;

    setError(null);

    const urlMatch = queryToSearch.match(/(?:youtube\.com\/(?:watch\?v=|live\/)(?:.*[?&]v=)?|youtu\.be\/)([^&\s?]+)/);

    if (urlMatch) {
      const newVideoId = urlMatch[1];
      updateWidgetPropsFromAtom({
        tabId: activeLayout.id,
        widgetId: widget.id,
        widgetProps: {
          ...widget.props,
          videoId: newVideoId,
          showSearch: false,
        },
      });
      setSearchQuery("");
      setSearchResults([]);
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setCurrentSearchQuery(queryToSearch);

    console.log(`🔍 Searching for: "${queryToSearch}" with filter: ${searchFilter}`);

    try {
      let results: SearchResult[];

      if (searchFilter === "channel") {
        results = await fetchChannels(queryToSearch);
        console.log(`💰 Total quota used: ~101 units`);
      } else if (searchFilter === "all") {
        const [videoResults, channelResults] = await Promise.all([
          fetchVideos(queryToSearch, "all", uploadDate, sortBy),
          fetchChannels(queryToSearch),
        ]);
        results = [...videoResults, ...channelResults];
        console.log(`💰 Total quota used: ~202 units (100+1 videos + 100+1 channels)`);
      } else {
        results = await fetchVideos(queryToSearch, searchFilter as VideoFilter, uploadDate, sortBy);
        console.log(`💰 Total quota used: ~101 units`);
      }

      setSearchResults(dedupe(results));

      updateWidgetPropsFromAtom({
        tabId: activeLayout.id,
        widgetId: widget.id,
        widgetProps: {
          ...widget.props,
          showSearch: true,
        },
      });
    } catch (error) {
      console.error("Search failed:", error);
      setError(error instanceof Error ? error.message : "Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchFilterChange = useCallback(
    async (filter: SearchFilter, dateFilter?: UploadDate, sortFilter?: SortBy) => {
      if (filter === searchFilter && !dateFilter && !sortFilter) return;
      if (!currentSearchQuery.trim()) return;

      // Use provided filters or fall back to state
      const effectiveDateFilter = dateFilter ?? uploadDate;
      const effectiveSortFilter = sortFilter ?? sortBy;

      setSearchFilter(filter);
      setIsSearching(true);
      setSearchResults([]);
      setError(null);

      try {
        let results: SearchResult[];

        if (filter === "channel") {
          results = await fetchChannels(currentSearchQuery);
        } else if (filter === "all") {
          const [videoResults, channelResults] = await Promise.all([
            fetchVideos(currentSearchQuery, "all", effectiveDateFilter, effectiveSortFilter),
            fetchChannels(currentSearchQuery),
          ]);
          results = [...videoResults, ...channelResults];
        } else {
          results = await fetchVideos(
            currentSearchQuery,
            filter as VideoFilter,
            effectiveDateFilter,
            effectiveSortFilter,
          );
        }

        setSearchResults(results);
      } catch (error) {
        console.error("Filter change failed:", error);
        setError(error instanceof Error ? error.message : "Failed to apply filter.");
      } finally {
        setIsSearching(false);
      }
    },
    [searchFilter, currentSearchQuery, uploadDate, sortBy, fetchVideos, fetchChannels],
  );

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    suggestions,
    isSearching,
    error,
    setError,
    handleSearch,
    searchFilter,
    handleSearchFilterChange,
    fetchSuggestions,
    uploadDate,
    setUploadDate,
    sortBy,
    setSortBy,
  };
}
