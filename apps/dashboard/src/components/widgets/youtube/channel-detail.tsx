import React from "react";
import Image from "next/image";
import { ArrowLeft, Users, Video as VideoIcon, Eye, Loader2 } from "lucide-react";
import { VideoFilters } from "./video-filters";
import { ChannelVideos } from "./channel-videos";
import { useChannelVideos } from "@/lib/utils/youtube/use-channel-videos";

interface ChannelDetailProps {
  channelId: string;
  onBack: () => void;
  onSelectVideo: (videoId: string) => void;
}

export function ChannelDetail({ channelId, onBack, onSelectVideo }: ChannelDetailProps) {
  const { channelDetails, videos, isLoading, error, activeFilter, handleFilterChange } = useChannelVideos(channelId);

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
        <button onClick={onBack} className="p-2 hover:bg-[#272727] rounded-lg transition-colors">
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
              {channelDetails.customUrl && <p className="text-xs text-[#aaa] mb-2">{channelDetails.customUrl}</p>}
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
        <VideoFilters activeFilter={activeFilter} onFilterChange={handleFilterChange} disabled={isLoading} />
      </div>

      {/* Videos List */}
      <div className="flex-1 rounded-lg overflow-hidden bg-black">
        <ChannelVideos videos={videos} selectVideo={onSelectVideo} />
      </div>
    </div>
  );
}
