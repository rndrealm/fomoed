"use client";

import { useEffect, useRef } from "react";
import SearchIcon from "@/components/icons/SearchIcon";
import NewsTags from "./news-tags";
import useUserData from "@/lib/hooks/use-user-data";

const allTags = ["All", "BTC", "ETH", "SOL", "XRP", "DOGE"];

// Tag to display name mapping
const tagDisplayMap: Record<string, string> = {
  All: "Latest",
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  XRP: "XRP",
  DOGE: "Dogecoin",
  Bookmarks: "Bookmarks",
};

const NewsMenu = ({
  selectedTag,
  setIsSearching,
  setSelectedTag,
}: {
  selectedTag: string;
  setIsSearching: (value: boolean) => void;
  setSelectedTag: (value: string) => void;
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tagRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const authUser = useUserData();

  // Create dynamic tags array based on login status
  const getAvailableTags = () => {
    if (authUser) {
      return ["All", "Bookmarks", ...allTags.slice(1)]; // Insert Bookmarks after All
    }
    return allTags;
  };

  const availableTags = getAvailableTags();

  // Scroll to active tag on mount and when selectedTag changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    const activeTagElement = tagRefs.current[selectedTag];

    if (container && activeTagElement) {
      const containerRect = container.getBoundingClientRect();
      const tagRect = activeTagElement.getBoundingClientRect();

      // Calculate if the tag is visible in the container
      const isVisible =
        tagRect.left >= containerRect.left &&
        tagRect.right <= containerRect.right;

      if (!isVisible) {
        // Calculate scroll position to center the active tag
        const containerWidth = container.clientWidth;
        const tagWidth = activeTagElement.offsetWidth;
        const tagOffsetLeft = activeTagElement.offsetLeft;

        const scrollLeft = tagOffsetLeft - containerWidth / 2 + tagWidth / 2;

        container.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: "smooth",
        });
      }
    }
  }, [selectedTag]);

  return (
    <div className="relative flex flex-col items-start justify-between gap-3 pb-4">
      {/* <div className="absolute top-2 right-0 flex translate-y-0 flex-row gap-1.5 rounded-[40px] bg-[#2A2A2A] px-3.5 py-2.5 lg:top-1/2 lg:-translate-y-1/2">
        <button>
          <PlayIcon />
        </button>

        <button>
          <SoundIcon />
        </button>
      </div> */}

      <div className="flex w-full items-center justify-between">
        <h2 className="text-[2.25rem] leading-[1.25] font-bold text-white">
          Popular
        </h2>
        <button className="block lg:hidden">
          <div
            onClick={() => setIsSearching(true)}
            className="static flex scale-100 flex-row items-center justify-center rounded-[8px] border-[1px] border-[#2A2A2A] bg-[#0C0C0C] p-2"
          >
            <SearchIcon color="#FFF" />
          </div>
        </button>
      </div>

      <div className="flex w-full flex-row items-center gap-0 lg:gap-4.5">
        {/* Search Icon */}
        <button className="hidden lg:block">
          <div
            onClick={() => setIsSearching(true)}
            className="static flex scale-100 flex-row items-center justify-center rounded-[8px] border-[1px] border-[#2A2A2A] bg-[#0C0C0C] p-2"
          >
            <SearchIcon color="#FFF" />
          </div>
        </button>

        {/* Tag filters */}
        <div
          ref={scrollContainerRef}
          className="no-scrollbar flex w-full flex-row gap-3 overflow-x-auto py-2"
        >
          {availableTags.map((tag) => {
            const stringTag = tagDisplayMap[tag] || tag;

            return (
              <div
                key={tag}
                ref={(el) => {
                  tagRefs.current[tag] = el;
                }}
              >
                <NewsTags
                  tag={tag}
                  stringTag={stringTag}
                  selectedTag={selectedTag}
                  setSelectedTag={setSelectedTag}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NewsMenu;
