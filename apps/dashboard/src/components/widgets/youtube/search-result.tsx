import React, { useEffect, useRef, useCallback } from "react";
import { SearchResult } from "@/lib/utils/youtube/types";
import { SearchResultCard } from "./search-result-card";
import { ChannelCard } from "./channel-card";
import { Loader2 } from "lucide-react";

interface SearchResultsProps {
  searchResults: SearchResult[];
  selectVideo: (videoId: string) => void;
  selectChannel: (channelId: string) => void;
  loadMoreResults: () => void;
  isLoadingMore: boolean;
  hasMore: boolean;
}

export function SearchResults({ 
  searchResults, 
  selectVideo,
  selectChannel,
  loadMoreResults, 
  isLoadingMore,
  hasMore 
}: SearchResultsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    console.log('Observer triggered:', {
      isIntersecting: entry.isIntersecting,
      hasMore,
      isLoadingMore,
      intersectionRatio: entry.intersectionRatio
    });
    
    if (entry.isIntersecting && hasMore && !isLoadingMore) {
      console.log('Loading more results...');
      loadMoreResults();
    }
  }, [hasMore, isLoadingMore, loadMoreResults]);

  useEffect(() => {
    const element = observerTarget.current;
    const container = scrollContainerRef.current;
    
    if (!element || !container) {
      console.log('Missing element or container');
      return;
    }

    console.log('Setting up observer');
    
    const observer = new IntersectionObserver(handleObserver, {
      root: container, // Use the scroll container as root
      rootMargin: '200px',
      threshold: 0,
    });

    observer.observe(element);

    return () => {
      console.log('Cleaning up observer');
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver]);

  return (
    <div 
      ref={scrollContainerRef}
      className="w-full h-full overflow-y-auto scrollbar p-2"
    >
      <div className="grid grid-cols-1 gap-3">
        {searchResults.map((result) => (
          result.type === 'channel' ? (
            <ChannelCard
              key={result.id}
              channel={result}
              onSelect={selectChannel}
            />
          ) : (
            <SearchResultCard
              key={result.id}
              result={result}
              onSelect={selectVideo}
            />
          )
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div 
        ref={observerTarget} 
        className="flex justify-center py-8 min-h-[50px]"
        style={{ border: '1px solid red' }} // Debug: visualize the trigger
      >
        {isLoadingMore ? (
          <div className="flex items-center gap-2 text-[#878787] text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading more...</span>
          </div>
        ) : hasMore ? (
          <div className="text-[#878787] text-xs">Scroll for more</div>
        ) : (
          <div className="text-center py-4 text-[#878787] text-sm">
            No more results
          </div>
        )}
      </div>
    </div>
  );
}