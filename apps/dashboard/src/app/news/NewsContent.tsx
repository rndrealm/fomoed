"use client";

import { useEffect, useRef } from "react";
import { useReadInfiniteNewsFeed } from "@/services/queries/news";
import FeedCard from "@/components/news/feed/feed-card";

const LoadingSpinner: React.FC = () => (
  <div className="border-opacity-80 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-transparent" />
);

const NewsContent = ({ isSearching, selectedTag }: { isSearching: boolean; selectedTag: string }) => {
  const {
    data: newsData,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useReadInfiniteNewsFeed(selectedTag === "All" ? undefined : selectedTag);

  // console.log("newsData", newsData);

  const bottomContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bottomEl = bottomContainerRef.current;

    if (!bottomEl || !hasNextPage || isFetchingNextPage || isPending || isSearching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // console.log("bottom reached");
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      }
    );

    observer.observe(bottomEl);

    return () => {
      if (bottomEl) observer.unobserve(bottomEl);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, newsData, isPending, isSearching]);

  return (
    <div className="relative w-full">
      {/* Loaders */}
      {(isPending || isFetchingNextPage) && (
        <div className="absolute inset-0 z-50 flex h-[calc(100svh-256px)] w-full items-center justify-center bg-black">
          <LoadingSpinner />
        </div>
      )}

      {/* Filtered widgets */}
      {!isSearching && (
        <div className="flex w-full flex-col gap-5 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
          {newsData?.map((newsContent, index) => {
            return <FeedCard article={newsContent} key={index} />;
          })}
        </div>
      )}

      {/* BottomContainer */}
      <div
        style={{ display: isPending ? "none" : "block" }}
        ref={bottomContainerRef}
        className="absolute bottom-0 left-0 h-10 w-full bg-transparent"
      ></div>
    </div>
  );
};

export default NewsContent;
