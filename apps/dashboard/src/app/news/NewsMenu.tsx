"use client";

import SearchIcon from "@/components/icons/SearchIcon";
import SoundIcon from "@/components/icons/SoundIcon";
import PlayIcon from "@/components/icons/PlayIcon";

const allTags = ["All", "BTC", "ETH", "SOL", "XRP", "DOGE"];

const NewsMenu = ({
  selectedTag,
  setIsSearching,
  setSelectedTag,
}: {
  selectedTag: string;
  setIsSearching: (value: boolean) => void;
  setSelectedTag: (value: string) => void;
}) => {
  return (
    <div className="relative flex flex-col items-start justify-between gap-3 pb-4">
      <div className="absolute top-2 right-0 flex translate-y-0 flex-row gap-1.5 rounded-[40px] bg-[#2A2A2A] px-3.5 py-2.5 lg:top-1/2 lg:-translate-y-1/2">
        <button>
          <PlayIcon />
        </button>

        <button>
          <SoundIcon />
        </button>
      </div>

      <h2 className="text-[2.25rem] leading-[1.25] font-bold text-white">Popular</h2>

      <div className="flex w-full flex-row items-center gap-0 lg:gap-4.5">
        {/* Search Icon */}
        <button>
          <div
            onClick={() => setIsSearching(true)}
            className="absolute top-[10px] right-20 flex scale-105 flex-row items-center justify-center rounded-[8px] border-[1px] border-[#2A2A2A] bg-[#0C0C0C] p-2 lg:static lg:scale-100"
          >
            <SearchIcon color="#FFF" />
          </div>
        </button>

        {/* Tag filters */}
        <div className="flex w-full flex-row flex-wrap gap-3 py-2">
          {allTags.map((tag) => {
            let stringTag = "Popular";
            if (tag === "BTC") {
              stringTag = "Bitcoin";
            } else if (tag === "ETH") {
              stringTag = "Ethereum";
            } else if (tag === "SOL") {
              stringTag = "Solana";
            } else if (tag === "XRP") {
              stringTag = "XRP";
            } else if (tag === "DOGE") {
              stringTag = "Dogecoin";
            }

            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`rounded-[10px] px-4.5 py-1 text-[14px] font-bold ${
                  selectedTag === tag ? "bg-[#FF5C02] text-white" : "text-[#C3C3C3] *:bg-black"
                }`}
              >
                {stringTag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NewsMenu;
