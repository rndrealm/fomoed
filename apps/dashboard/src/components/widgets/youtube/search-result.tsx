import React from "react";
import { SearchResult } from "@/lib/utils/youtube/types";
import { SearchResultCard } from "./search-result-card";
import { ChannelCard } from "./channel-card";

interface SearchResultsProps {
  searchResults: SearchResult[];
  selectVideo: (videoId: string) => void;
  selectChannel: (channelId: string) => void;
}

export function SearchResults({ searchResults, selectVideo, selectChannel }: SearchResultsProps) {
  return (
    <div className="w-full h-full overflow-y-auto scrollbar p-2">
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {searchResults.map((result) =>
            result.type === "channel" ? (
              <ChannelCard key={result.id} channel={result} onSelect={selectChannel} />
            ) : (
              <SearchResultCard key={result.id} result={result} onSelect={selectVideo} />
            ),
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-[#878787] text-sm">No results found</div>
      )}
    </div>
  );
}
