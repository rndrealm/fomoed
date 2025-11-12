import React from "react";
import { SearchResult } from "@/lib/utils/youtube/types";
import { SearchResultCard } from "./search-result-card";

interface ChannelVideosProps {
  videos: SearchResult[];
  selectVideo: (videoId: string) => void;
}

export function ChannelVideos({ videos, selectVideo }: ChannelVideosProps) {
  return (
    <div className="w-full h-full overflow-y-auto scrollbar p-2">
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {videos.map((video) => (
            <SearchResultCard key={video.id} result={video} onSelect={selectVideo} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-[#878787] text-sm">No videos found</div>
      )}
    </div>
  );
}
