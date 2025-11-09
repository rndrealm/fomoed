import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { ArrowLeft, Users, Video as VideoIcon, Eye, Loader2 } from "lucide-react";
import { ChannelDetails, SearchResult, VideoFilter } from "@/lib/utils/youtube/types";
import { VideoFilters } from "./video-filters";
import { SearchResultCard } from "./search-result-card";

interface ChannelDetailProps {
  channelId: string;
  onBack: () => void;
  onSelectVideo: (videoId: string) => void;
}

export function ChannelDetail({ channelId, onBack, onSelectVideo }: ChannelDetailProps) {
  const [channelDetails, setChannelDetails] = useState<ChannelDetails | null>(null);
  const [videos, setVideos] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState<VideoFilter>('all');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchChannelDetails = useCallback(async () => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      if (!API_KEY) throw new Error("YouTube API key not configured");

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${API_KEY}`
      );

      if (!response.ok) throw new Error("Failed to fetch channel details");

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const channel = data.items[0];
        setChannelDetails({
          id: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description,
          thumbnail: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.default?.url,
          bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl,
          subscriberCount: channel.statistics.subscriberCount,
          videoCount: channel.statistics.videoCount,
          viewCount: channel.statistics.viewCount,
          customUrl: channel.snippet.customUrl,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load channel");
    }
  }, [channelId]);

  const fetchChannelVideos = useCallback(async (pageToken: string | null = null, filter: VideoFilter = 'all') => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      if (!API_KEY) throw new Error("YouTube API key not configured");

      const pageTokenParam = pageToken ? `&pageToken=${pageToken}` : '';
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=20&order=date&type=video${pageTokenParam}&key=${API_KEY}`
      );

      if (!response.ok) throw new Error("Failed to fetch videos");

      const data = await response.json();
      const videoIds = data.items.map((item: any) => item.id.videoId).join(",");

      if (!videoIds) {
        return { results: [], nextPageToken: null };
      }

      const detailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${API_KEY}`
      );

      const detailsData = await detailsResponse.json();
      
      let results: SearchResult[] = detailsData.items?.map((item: any) => {
        const duration = item.contentDetails?.duration;
        const liveBroadcastContent = item.snippet?.liveBroadcastContent;
        const isLive = liveBroadcastContent === 'live' || liveBroadcastContent === 'upcoming';
        
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
          type: 'video' as const,
        };
      }) || [];

      // Client-side filtering
      if (filter !== 'all') {
        results = results.filter(result => result.videoType === filter);
      }

      return {
        results,
        nextPageToken: data.nextPageToken || null,
      };
    } catch (err) {
      throw err;
    }
  }, [channelId]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await fetchChannelDetails();
        const { results, nextPageToken: token } = await fetchChannelVideos(null, activeFilter);
        setVideos(results);
        setNextPageToken(token);
        setHasMore(!!token);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [channelId, fetchChannelDetails, fetchChannelVideos, activeFilter]);

  const loadMoreVideos = useCallback(async () => {
    if (!nextPageToken || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const { results, nextPageToken: token } = await fetchChannelVideos(nextPageToken, activeFilter);
      setVideos(prev => [...prev, ...results]);
      setNextPageToken(token);
      setHasMore(!!token);
    } catch (err) {
      console.error("Failed to load more videos:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageToken, isLoadingMore, activeFilter, fetchChannelVideos]);

  const handleFilterChange = async (filter: VideoFilter) => {
    if (filter === activeFilter) return;
    
    setActiveFilter(filter);
    setIsLoading(true);
    setVideos([]);
    setNextPageToken(null);
    
    try {
      const { results, nextPageToken: token } = await fetchChannelVideos(null, filter);
      setVideos(results);
      setNextPageToken(token);
      setHasMore(!!token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply filter");
    } finally {
      setIsLoading(false);
    }
  };

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMore && !isLoadingMore) {
      loadMoreVideos();
    }
  }, [hasMore, isLoadingMore, loadMoreVideos]);

  useEffect(() => {
    const element = observerTarget.current;
    const container = scrollContainerRef.current;
    
    if (!element || !container) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: container,
      rootMargin: '200px',
      threshold: 0,
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver]);

  const formatCount = (count: string) => {
    const num = parseInt(count);
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  if (isLoading && !channelDetails) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (error && !channelDetails) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#272727] hover:bg-[#333] rounded-lg text-sm text-white">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#272727] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-sm font-semibold text-white">Channel</h2>
      </div>

      {/* Channel Info */}
      {channelDetails && (
        <div className="bg-[#141414] rounded-lg p-4 mb-3">
          <div className="flex gap-4 items-start">
            <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
              <Image src={channelDetails.thumbnail} alt={channelDetails.title} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white mb-1">{channelDetails.title}</h3>
              {channelDetails.customUrl && (
                <p className="text-xs text-[#aaa] mb-2">@{channelDetails.customUrl}</p>
              )}
              <div className="flex flex-wrap gap-3 text-xs text-[#aaa]">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{formatCount(channelDetails.subscriberCount)} subscribers</span>
                </div>
                <div className="flex items-center gap-1">
                  <VideoIcon className="w-3 h-3" />
                  <span>{formatCount(channelDetails.videoCount)} videos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatCount(channelDetails.viewCount)} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Filters */}
      <div className="mb-3">
        <VideoFilters
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          disabled={isLoading}
        />
      </div>

      {/* Videos List */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scrollbar rounded-lg bg-black p-2"
      >
        {videos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-3">
              {videos.map((video) => (
                <SearchResultCard
                  key={video.id}
                  result={video}
                  onSelect={onSelectVideo}
                />
              ))}
            </div>

            <div ref={observerTarget} className="flex justify-center py-8 min-h-[50px]">
              {isLoadingMore ? (
                <div className="flex items-center gap-2 text-[#878787] text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading more...</span>
                </div>
              ) : hasMore ? (
                <div className="text-[#878787] text-xs">Scroll for more</div>
              ) : (
                <div className="text-center text-[#878787] text-sm">
                  No more videos
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-[#878787] text-sm">
            No videos found
          </div>
        )}
      </div>
    </div>
  );
}