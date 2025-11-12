import React from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { SearchResult } from "@/lib/utils/youtube/types";
import { formatDuration, formatViews, formatPublishedDate } from "@/lib/utils/youtube/utils";

interface SearchResultCardProps {
  result: SearchResult;
  onSelect: (videoId: string) => void;
  compact?: boolean;
}

export function SearchResultCard({ result, onSelect, compact = false }: SearchResultCardProps) {
  if (compact) {
    return (
      <button
        onClick={() => onSelect(result.id)}
        className="flex gap-2 p-2 hover:bg-[#272727] rounded-lg transition-colors text-left w-full"
      >
        <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden">
          <Image src={result.thumbnail} alt={result.title} fill className="object-cover" />
          {result.isLive && (
            <div className="absolute top-0.5 left-0.5 bg-red-600 px-1 py-0.5 rounded text-[10px] font-bold text-white">
              LIVE
            </div>
          )}
          {result.duration && !result.isLive && (
            <div className="absolute bottom-0.5 right-0.5 bg-black/80 px-1 py-0.5 rounded text-[10px] font-semibold text-white">
              {formatDuration(result.duration)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-medium text-white line-clamp-2 leading-tight">{result.title}</h3>
          <p className="text-[10px] text-[#aaa] mt-0.5">{result.channelTitle}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect(result.id)}
      className="flex gap-3 p-2 bg-[#141414] hover:bg-[#1a1a1a] rounded-lg transition-colors text-left group"
    >
      <div className="relative w-48 h-28 flex-shrink-0 rounded overflow-hidden">
        <Image src={result.thumbnail} alt={result.title} fill sizes="96px" className="object-cover" />
        {result.isLive && (
          <div className="absolute top-1 left-1 bg-red-600 px-1.5 py-0.5 rounded text-xs font-bold text-white">
            LIVE
          </div>
        )}
        {result.videoType === "short" && (
          <div className="absolute top-1 left-1 bg-white px-1.5 py-0.5 rounded text-xs font-bold text-black">SHORT</div>
        )}
        {result.duration && !result.isLive && (
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
  );
}
