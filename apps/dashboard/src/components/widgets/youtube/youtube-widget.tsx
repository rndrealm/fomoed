"use client";
import React, { useState } from "react";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { WidgetWrapper } from "../shared";
import { Search, Play } from "lucide-react";
import Image from "next/image";

interface IProps {
  widget: LayoutType["widgets"][0];
}

interface SearchResult {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  description: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  isLive?: boolean;
}

export default function YoutubeWidget(props: IProps) {
  const { widget } = props;
  const [showInfo, setShowInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  // Get video ID from widget props or use default
  const videoId = widget?.props?.videoId;
  const showSearch = widget?.props?.showSearch || false;

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
      return;
    }

    setIsSearching(true);
    try {
      const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

      if (!API_KEY) {
        setError("YouTube API key is not configured. Please add NEXT_PUBLIC_YOUTUBE_API_KEY to your .env.local file.");
        setIsSearching(false);
        return;
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(searchQuery)}&key=${API_KEY}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Search failed");
      }

      const data = await response.json();
      const videoIds = data.items.map((item: any) => item.id.videoId).join(",");

      const detailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`,
      );

      const detailsData = await detailsResponse.json();
      const videoDetails = new Map<string, { duration?: string; viewCount?: string }>(
        detailsData.items?.map((item: any) => [
          item.id,
          {
            duration: item.contentDetails?.duration,
            viewCount: item.statistics?.viewCount,
          },
        ]) || [],
      );

      const results: SearchResult[] = data.items.map((item: any) => {
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
          isLive: item.snippet.liveBroadcastContent === "live",
        };
      });

      setSearchResults(results);
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

  const selectVideo = (videoId: string) => {
    if (!videoId || videoId.trim() === "") {
      setError("Invalid video selected.");
      return;
    }

    updateWidgetPropsFromAtom({
      tabId: activeLayout.id,
      widgetId: widget.id,
      widgetProps: {
        ...widget.props,
        videoId: videoId,
        showSearch: false,
      },
    });
    setSearchResults([]);
    setSearchQuery("");
    setError(null);
  };

  const formatDuration = (duration?: string) => {
    if (!duration) return "";
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "";

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatViews = (viewCount?: string) => {
    if (!viewCount) return "";
    const views = parseInt(viewCount);
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const formatPublishedDate = (publishedAt: string) => {
    const date = new Date(publishedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <WidgetWrapper
      title="YOUTUBE"
      widget={widget}
      handleLearnMore={() => {
        setShowInfo(true);
      }}
    >
      <div className="flex flex-col gap-3 h-full">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-[#141414] rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-[#878787]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Paste YouTube URL or search..."
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#878787]"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-[#272727] hover:bg-[#333] rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
          >
            {isSearching ? "..." : "Go"}
          </button>
        </form>

        {error && (
          <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex-1 rounded-lg overflow-hidden bg-black">
          {showSearch && searchResults.length > 0 ? (
            <div className="w-full h-full overflow-y-auto scrollbar p-2">
              <div className="grid grid-cols-1 gap-3">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => selectVideo(result.id)}
                    className="flex gap-3 p-2 bg-[#141414] hover:bg-[#1a1a1a] rounded-lg transition-colors text-left group"
                  >
                    <div className="relative w-48 h-28 flex-shrink-0 rounded overflow-hidden">
                      <Image src={result.thumbnail} alt={result.title} fill className="object-cover" />
                      {result.isLive && (
                        <div className="absolute top-1 left-1 bg-red-600 px-1.5 py-0.5 rounded text-xs font-bold text-white">
                          LIVE
                        </div>
                      )}
                      {result.duration && (
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs font-semibold text-white">
                          {formatDuration(result.duration)}
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                        <div className="bg-black/70 rounded-full p-2">
                          <Play className="w-6 h-6 text-white" fill="white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <h3 className="text-sm font-medium text-white line-clamp-2 leading-tight">{result.title}</h3>
                      <p className="text-xs text-[#aaa]">{result.channelTitle}</p>
                      <div className="flex items-center gap-1 text-xs text-[#aaa]">
                        {result.viewCount && (
                          <>
                            <span>{formatViews(result.viewCount)}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{formatPublishedDate(result.publishedAt)}</span>
                      </div>
                      {result.description && (
                        <p className="text-xs text-[#878787] line-clamp-2 leading-tight mt-0.5">{result.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : videoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&fs=1&iv_load_policy=3&disablekb=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#878787] text-sm">
              Search a YouTube video to get started
            </div>
          )}
        </div>
      </div>
    </WidgetWrapper>
  );
}
