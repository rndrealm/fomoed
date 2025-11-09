import { useState, useCallback } from "react";
import { SearchResult, VideoFilter, SearchFilter } from "./types";

export function useYoutubeSearch(widget: any, activeLayout: any, updateWidgetPropsFromAtom: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState<VideoFilter>('all');
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('all');
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");

  const fetchChannels = useCallback(async (
    query: string,
    pageToken: string | null = null
  ): Promise<{ results: SearchResult[]; nextPageToken: string | null }> => {
    const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

    if (!API_KEY) {
      throw new Error("YouTube API key is not configured.");
    }

    const pageTokenParam = pageToken ? `&pageToken=${pageToken}` : '';
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=channel${pageTokenParam}&key=${API_KEY}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Search failed");
    }

    const data = await response.json();
    const channelIds = data.items.map((item: any) => item.id.channelId).join(",");

    if (!channelIds) {
      return { results: [], nextPageToken: null };
    }

    // Fetch channel details
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds}&key=${API_KEY}`,
    );

    const detailsData = await detailsResponse.json();

    const results: SearchResult[] = detailsData.items?.map((item: any) => ({
      id: item.id,
      channelId: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      subscriberCount: item.statistics.subscriberCount,
      videoCount: item.statistics.videoCount,
      type: 'channel' as const,
    })) || [];

    return {
      results,
      nextPageToken: data.nextPageToken || null,
    };
  }, []);

  const fetchVideos = useCallback(async (
    query: string,
    pageToken: string | null = null,
    filter: VideoFilter = 'all'
  ): Promise<{ results: SearchResult[]; nextPageToken: string | null }> => {
    const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

    if (!API_KEY) {
      throw new Error("YouTube API key is not configured. Please add NEXT_PUBLIC_YOUTUBE_API_KEY to your .env.local file.");
    }

    // Build filter parameters
    let videoDuration = '';
    let eventType = '';
    
    if (filter === 'short') {
      videoDuration = '&videoDuration=short';
    } else if (filter === 'live') {
      eventType = '&eventType=live';
    } else if (filter === 'video') {
      videoDuration = '&videoDuration=medium';
    }

    const pageTokenParam = pageToken ? `&pageToken=${pageToken}` : '';
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video${videoDuration}${eventType}${pageTokenParam}&key=${API_KEY}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Search failed");
    }

    const data = await response.json();
    const videoIds = data.items.map((item: any) => item.id.videoId).join(",");

    if (!videoIds) {
      return { results: [], nextPageToken: null };
    }

    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,liveStreamingDetails,snippet&id=${videoIds}&key=${API_KEY}`,
    );

    const detailsData = await detailsResponse.json();
    const videoDetails = new Map<string, { 
      duration?: string; 
      viewCount?: string;
      isLive?: boolean;
      videoType?: 'video' | 'short' | 'live';
    }>(
      detailsData.items?.map((item: any) => {
        const duration = item.contentDetails?.duration;
        const liveBroadcastContent = item.snippet?.liveBroadcastContent;
        const isLive = liveBroadcastContent === 'live' || liveBroadcastContent === 'upcoming' || item.liveStreamingDetails?.actualStartTime;
        
        let videoType: 'video' | 'short' | 'live' = 'video';
        if (isLive) {
          videoType = 'live';
        } else if (duration) {
          const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          if (match) {
            const hours = match[1] ? parseInt(match[1]) : 0;
            const minutes = match[2] ? parseInt(match[2]) : 0;
            const seconds = match[3] ? parseInt(match[3]) : 0;
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            if (totalSeconds <= 60) {
              videoType = 'short';
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

    // Filter results based on the selected filter
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
        videoType: details?.videoType || 'video',
      };
    });

    // Client-side filtering to ensure only the correct type is shown
    if (filter !== 'all') {
      results = results.filter(result => result.videoType === filter);
    }

    // If filtering removed all results but there's a next page, we should still return the token
    // so the UI can fetch more results
    return {
      results,
      nextPageToken: data.nextPageToken || null,
    };
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      // Use our API route to avoid CORS issues
      const response = await fetch(
        `/api/youtube/suggestions?q=${encodeURIComponent(query)}`
      );
      
      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setError(null);

    const urlMatch = searchQuery.match(/(?:youtube\.com\/(?:watch\?v=|live\/)(?:.*[?&]v=)?|youtu\.be\/)([^&\s?]+)/);

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
    setNextPageToken(null);
    setHasMore(true);
    setCurrentSearchQuery(searchQuery);
    
    try {
      let results: SearchResult[];
      let token: string | null;

      if (searchFilter === 'channels') {
        const channelData = await fetchChannels(searchQuery);
        results = channelData.results;
        token = channelData.nextPageToken;
      } else if (searchFilter === 'videos') {
        const videoData = await fetchVideos(searchQuery, null, activeFilter);
        results = videoData.results;
        token = videoData.nextPageToken;
      } else {
        // 'all' - fetch both videos and channels
        const [videoData, channelData] = await Promise.all([
          fetchVideos(searchQuery, null, activeFilter),
          fetchChannels(searchQuery)
        ]);
        results = [...videoData.results, ...channelData.results];
        token = videoData.nextPageToken; // Use video token for pagination
      }
      
      setSearchResults(results);
      setNextPageToken(token);
      setHasMore(!!token);
      
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

  const loadMoreResults = useCallback(async () => {
    if (!nextPageToken || isLoadingMore || !currentSearchQuery.trim()) {
      console.log('Load more blocked:', { nextPageToken, isLoadingMore, currentSearchQuery });
      return;
    }

    console.log('Loading more results with token:', nextPageToken);
    setIsLoadingMore(true);
    try {
      let results: SearchResult[];
      let token: string | null;

      if (searchFilter === 'channels') {
        const channelData = await fetchChannels(currentSearchQuery, nextPageToken);
        results = channelData.results;
        token = channelData.nextPageToken;
      } else {
        // For 'videos' or 'all', load more videos
        const videoData = await fetchVideos(currentSearchQuery, nextPageToken, activeFilter);
        results = videoData.results;
        token = videoData.nextPageToken;
      }
      
      console.log('Fetched results:', results.length, 'Next token:', token);
      
      setSearchResults(prev => [...prev, ...results]);
      setNextPageToken(token);
      setHasMore(!!token);
    } catch (error) {
      console.error("Load more failed:", error);
      setError(error instanceof Error ? error.message : "Failed to load more results.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageToken, isLoadingMore, currentSearchQuery, searchFilter, activeFilter, fetchVideos, fetchChannels]);

  const handleSearchFilterChange = useCallback(async (filter: SearchFilter) => {
    if (filter === searchFilter || !currentSearchQuery.trim()) return;
    
    setSearchFilter(filter);
    setIsSearching(true);
    setSearchResults([]);
    setNextPageToken(null);
    setError(null);
    
    try {
      let results: SearchResult[];
      let token: string | null;

      if (filter === 'channels') {
        const channelData = await fetchChannels(currentSearchQuery);
        results = channelData.results;
        token = channelData.nextPageToken;
      } else if (filter === 'videos') {
        const videoData = await fetchVideos(currentSearchQuery, null, activeFilter);
        results = videoData.results;
        token = videoData.nextPageToken;
      } else {
        const [videoData, channelData] = await Promise.all([
          fetchVideos(currentSearchQuery, null, activeFilter),
          fetchChannels(currentSearchQuery)
        ]);
        results = [...videoData.results, ...channelData.results];
        token = videoData.nextPageToken;
      }
      
      setSearchResults(results);
      setNextPageToken(token);
      setHasMore(!!token);
    } catch (error) {
      console.error("Filter change failed:", error);
      setError(error instanceof Error ? error.message : "Failed to apply filter.");
    } finally {
      setIsSearching(false);
    }
  }, [searchFilter, currentSearchQuery, activeFilter, fetchVideos, fetchChannels]);

  const handleFilterChange = useCallback(async (filter: VideoFilter) => {
    if (filter === activeFilter || !currentSearchQuery.trim()) return;
    
    setActiveFilter(filter);
    setIsSearching(true);
    setSearchResults([]);
    setNextPageToken(null);
    setError(null);
    
    try {
      const { results, nextPageToken: token } = await fetchVideos(currentSearchQuery, null, filter);
      
      setSearchResults(results);
      setNextPageToken(token);
      setHasMore(!!token);
    } catch (error) {
      console.error("Filter change failed:", error);
      setError(error instanceof Error ? error.message : "Failed to apply filter.");
    } finally {
      setIsSearching(false);
    }
  }, [activeFilter, currentSearchQuery, fetchVideos]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    suggestions,
    isSearching,
    isLoadingMore,
    error,
    setError,
    handleSearch,
    loadMoreResults,
    hasMore,
    activeFilter,
    handleFilterChange,
    searchFilter,
    handleSearchFilterChange,
    fetchSuggestions,
  };
}