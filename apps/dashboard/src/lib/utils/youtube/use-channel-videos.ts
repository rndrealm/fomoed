import { useState, useCallback, useEffect } from "react";
import { SearchResult, VideoFilter, ChannelDetails } from "./types";

const cache = new Map<string, { data: any; expiry: number }>();

function getCached(key: string) {
  const item = cache.get(key);
  if (item && item.expiry > Date.now()) {
    console.log(`✅ Cache hit: ${key}`);
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any, ttlMinutes: number = 10) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlMinutes * 60 * 1000,
  });
}

export function useChannelVideos(channelId: string) {
  const [channelDetails, setChannelDetails] = useState<ChannelDetails | null>(null);
  const [videos, setVideos] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<VideoFilter>("all");
  const [uploadsPlaylistId, setUploadsPlaylistId] = useState<string | null>(null);

  const fetchChannelDetails = useCallback(async () => {
    try {
      const cacheKey = `channel:${channelId}`;
      const cached = getCached(cacheKey);
      if (cached) {
        setChannelDetails(cached.details);
        setUploadsPlaylistId(cached.uploadsId);
        return cached.uploadsId;
      }

      const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      if (!API_KEY) throw new Error("YouTube API key not configured");

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&fields=items(id,snippet(title,description,thumbnails,customUrl),statistics(subscriberCount,videoCount,viewCount),contentDetails/relatedPlaylists/uploads)&key=${API_KEY}`,
      );

      if (!response.ok) throw new Error("Failed to fetch channel details");

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const channel = data.items[0];
        const uploadsId = channel.contentDetails.relatedPlaylists?.uploads ?? null;

        const details = {
          id: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description,
          thumbnail: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.default?.url,
          bannerUrl: undefined,
          subscriberCount: channel.statistics.subscriberCount,
          videoCount: channel.statistics.videoCount,
          viewCount: channel.statistics.viewCount,
          customUrl: channel.snippet.customUrl,
        };

        setUploadsPlaylistId(uploadsId);
        setChannelDetails(details);

        setCache(cacheKey, { details, uploadsId }, 15);

        return uploadsId;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load channel");
    }
  }, [channelId]);

  const fetchChannelVideos = useCallback(
    async (uploadsPlaylistId: string | null, filter: VideoFilter = "all"): Promise<SearchResult[]> => {
      try {
        const cacheKey = `channel-videos:${uploadsPlaylistId}:${filter}`;
        const cached = getCached(cacheKey);
        if (cached) {
          return cached;
        }

        const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
        if (!API_KEY) throw new Error("YouTube API key not configured");

        if (!uploadsPlaylistId) return [];

        const playlistResp = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=25&fields=items/snippet/resourceId/videoId&key=${API_KEY}`,
        );

        if (!playlistResp.ok) throw new Error("Failed to fetch playlist videos");

        const playlistData = await playlistResp.json();

        const videoIds = playlistData.items
          ?.map((item: any) => item.snippet?.resourceId?.videoId)
          .filter(Boolean)
          .join(",");

        if (!videoIds) {
          return [];
        }

        const detailsResp = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds}&fields=items(id,snippet(title,thumbnails,channelTitle,description,publishedAt,liveBroadcastContent),contentDetails/duration,statistics/viewCount)&key=${API_KEY}`,
        );

        if (!detailsResp.ok) throw new Error("Failed to fetch video details");

        const detailsData = await detailsResp.json();

        let results: SearchResult[] =
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

            return {
              id: item.id,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.medium.url,
              channelTitle: item.snippet.channelTitle,
              description: item.snippet.description,
              publishedAt: item.snippet.publishedAt,
              duration: item.contentDetails?.duration,
              viewCount: item.statistics?.viewCount,
              isLive,
              videoType,
              type: "video",
            };
          }) ?? [];

        if (filter !== "all") {
          results = results.filter((v) => v.videoType === filter);
        }

        setCache(cacheKey, results, 10);
        return results;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const uploadsId = await fetchChannelDetails();
        if (!uploadsId) return;
        const results = await fetchChannelVideos(uploadsId, activeFilter);
        setVideos(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [channelId, fetchChannelDetails, fetchChannelVideos, activeFilter]);

  const handleFilterChange = useCallback(
    async (filter: VideoFilter) => {
      if (filter === activeFilter) return;

      setActiveFilter(filter);
      setIsLoading(true);
      setVideos([]);

      try {
        const results = await fetchChannelVideos(uploadsPlaylistId, filter);
        setVideos(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to apply filter");
      } finally {
        setIsLoading(false);
      }
    },
    [activeFilter, fetchChannelVideos, uploadsPlaylistId],
  );

  return {
    channelDetails,
    videos,
    isLoading,
    error,
    activeFilter,
    handleFilterChange,
  };
}
