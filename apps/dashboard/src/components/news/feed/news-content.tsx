"use client";

import { useEffect, useRef } from "react";
import { useReadNewsFeedUnified } from "@/services/queries/news";
import FeedCard from "@/components/news/feed/feed-card";

const LoadingSpinner: React.FC = () => (
  <div className="border-opacity-80 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-transparent" />
);

const NoFetchedNewsSvg = () => (
  <svg
    width="400"
    height="400"
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#filter0_i_9205_165970)">
      <rect
        width="186"
        height="264"
        transform="translate(124 68)"
        fill="url(#paint0_linear_9205_165970)"
      />
    </g>
    <path d="M0 69H400" stroke="#131313" strokeWidth="2.5" />
    <path d="M310 400L310 5.00679e-06" stroke="#131313" strokeWidth="2.5" />
    <path d="M124 400L124 5.00679e-06" stroke="#131313" strokeWidth="2.5" />
    <path d="M0 332H400" stroke="#131313" strokeWidth="2.5" />
    <defs>
      <filter
        id="filter0_i_9205_165970"
        x="124"
        y="68"
        width="187"
        height="265"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dx="1" dy="1" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.566476 0 0 0 0 0.219103 0 0 0 0 0.798058 0 0 0 0.35 0"
        />
        <feBlend
          mode="normal"
          in2="shape"
          result="effect1_innerShadow_9205_165970"
        />
      </filter>
      <linearGradient
        id="paint0_linear_9205_165970"
        x1="82"
        y1="-58"
        x2="82"
        y2="730"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.0558376" stopColor="#0F0F0F" />
        <stop offset="0.230964" stopColor="#2E1A0D" />
        <stop offset="0.444162" stopColor="#682F09" />
        <stop offset="0.601523" stopColor="#933F07" />
        <stop offset="0.708122" stopColor="#B04905" />
        <stop offset="1" stopColor="#FF6600" />
      </linearGradient>
    </defs>
  </svg>
);

const EmptySearchState = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <NoFetchedNewsSvg />
      <div className="flex flex-col items-center justify-center gap-1.5">
        <div className="flex flex-col items-center justify-center gap-1.5">
          <p className="text-[18px] font-medium text-white">
            Currently have no news Articles
          </p>
          <p className="text-xs font-semibold text-[#A4A4A4]">
            We’re trying to fetch the most recent news for you
          </p>
        </div>
      </div>
    </div>
  );
};

const NewsContent = ({
  isSearching,
  selectedTag,
}: {
  isSearching: boolean;
  selectedTag: string;
}) => {
  const {
    data: newsData,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    isBookmarksTab,
  } = useReadNewsFeedUnified(selectedTag);

  const bottomContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bottomEl = bottomContainerRef.current;

    // Only set up intersection observer for infinite scroll (not bookmarks)
    if (
      !bottomEl ||
      !hasNextPage ||
      isFetchingNextPage ||
      isPending ||
      isSearching ||
      isBookmarksTab ||
      !fetchNextPage
    )
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      },
    );

    observer.observe(bottomEl);

    return () => {
      if (bottomEl) observer.unobserve(bottomEl);
    };
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    newsData,
    isPending,
    isSearching,
    isBookmarksTab,
  ]);

  return (
    <div className="relative w-full">
      {/* Loaders */}
      {(isPending || isFetchingNextPage) && (
        <div className="absolute inset-0 z-40 flex h-[calc(100svh-256px)] w-full items-center justify-center bg-black">
          <LoadingSpinner />
        </div>
      )}

      {/* Filtered widgets */}
      {!isSearching && (
        <div className="flex w-full flex-col gap-5 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
          {newsData?.map((newsContent, index) => {
            return <FeedCard article={newsContent as any} key={index} />;
          })}
        </div>
      )}

      {/* if there are no news fetched on bookmark */}
      {newsData.length === 0 && (
        <div className="pt-14">
          <EmptySearchState />
        </div>
      )}

      {/* BottomContainer - only show for infinite scroll */}
      {!isBookmarksTab && newsData.length > 6 && (
        <div
          style={{ display: isPending ? "none" : "block" }}
          ref={bottomContainerRef}
          className="absolute bottom-0 left-0 h-10 w-full bg-transparent"
        ></div>
      )}
    </div>
  );
};

export default NewsContent;
