import React from "react";
import Image from "next/image";
import { Users, Video } from "lucide-react";
import { SearchResult } from "@/lib/utils/youtube/types";

interface ChannelCardProps {
  channel: SearchResult;
  onSelect: (channelId: string) => void;
}

export function ChannelCard({ channel, onSelect }: ChannelCardProps) {
  const formatSubscribers = (count?: string) => {
    if (!count) return "Unknown";
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M subscribers`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K subscribers`;
    }
    return `${num} subscribers`;
  };

  const formatVideoCount = (count?: string) => {
    if (!count) return "";
    const num = parseInt(count);
    return `${num.toLocaleString()} videos`;
  };

  return (
    <button
      onClick={() => onSelect(channel.channelId || channel.id)}
      className="flex flex-col items-center gap-3 p-4 bg-[#141414] hover:bg-[#1a1a1a] rounded-lg transition-colors text-center group w-full"
    >
      <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#272727] group-hover:ring-[#333]">
        <Image src={channel.thumbnail} alt={channel.title} fill className="object-cover" />
      </div>

      <div className="flex flex-col gap-1 w-full">
        <h3 className="text-base font-semibold text-white line-clamp-1">{channel.title}</h3>

        <div className="flex items-center justify-center gap-2 text-xs text-[#aaa]">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{formatSubscribers(channel.subscriberCount)}</span>
          </div>
          {channel.videoCount && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Video className="w-3 h-3" />
                <span>{formatVideoCount(channel.videoCount)}</span>
              </div>
            </>
          )}
        </div>

        {channel.description && <p className="text-xs text-[#878787] line-clamp-2 mt-1">{channel.description}</p>}
      </div>
    </button>
  );
}
