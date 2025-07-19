"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { timeAgo } from "@/lib/utils";
import { useReadInfiniteNewsFeed } from "@/services/queries/news";

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
      {/* {isFetchingNextPage &&
                    <div className="fixed z-50 inset-0 w-full h-screen bg-black flex items-center">
                        <LoadingSpinner />
                    </div>
                } */}

      {/* Filtered widgets */}
      {!isSearching && (
        <div className="flex w-full flex-col gap-5 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
          {newsData?.map((newsContent, index) => {
            // const publishedAt = newsContent.published_at;
            // const date = new Date(publishedAt);
            // const formattedDate = `${date.toLocaleTimeString('en-US', {
            //     hour: 'numeric',
            //     minute: '2-digit',
            //     hour12: true,
            //     timeZone: 'GMT'
            // })} GMT, ${date.toLocaleString('en-US', {
            //     month: 'long',
            //     day: 'numeric',
            //     year: 'numeric',
            //     timeZone: 'GMT'
            // })}`;

            const formattedDate = timeAgo(newsContent.published_at);

            return (
              <div
                key={index}
                style={{
                  gridColumn: `span ${1}`,
                  gridRow: `span ${1}`,
                  boxShadow: "0px 4px 4px 0px #00000040",
                }}
                className="relative h-[500px] gap-1.5 overflow-hidden rounded-[16px] bg-[#121212] px-4.5 pt-3 pb-3.5 sm:h-[354px]"
              >
                {/* Background image */}
                <div
                  style={{
                    backgroundImage: `url(${newsContent.image_url || "/fallback.png"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  className="absolute inset-0 z-0 rounded-[18px]"
                ></div>

                {/* Blur */}
                <div className="absolute inset-0 z-0 h-full w-[105%]">
                  <div className="gradient-blur">
                    <div></div>
                    <div></div>
                    {/* <div></div> */}
                    {/* <div></div> */}
                    {/* <div></div> */}
                    {/* <div></div> */}
                  </div>
                </div>

                {/* Dark */}

                <div
                  className="absolute inset-0 z-0 h-full w-full"
                  style={{
                    background: `linear-gradient(
                                        to bottom,
                                        rgba(0, 0, 0, 0) 0%,
                                        rgba(0, 0, 0, 0.125) 12.56%,
                                        rgba(0, 0, 0, 0.325) 32.33%,
                                        rgba(0, 0, 0, 0.5) 45.58%,
                                        rgba(0, 0, 0, 1) 100%
                                        )`,
                  }}
                />

                <div className="relative z-[7] flex h-full w-[85%] flex-col items-start justify-end gap-1.5">
                  <p className="text-xs font-normal text-[#A4A4A4]">{newsContent.source}</p>
                  <p className="text-[18px] leading-[1.2] font-medium text-white">{newsContent.title}</p>
                  <p className="text-[13px] leading-[1.3] font-semibold text-[#A4A4A4]">{newsContent.summary}</p>
                  <p className="mt-1 text-xs font-normal text-[#A4A4A4]">{formattedDate}</p>
                </div>
              </div>
            );
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
