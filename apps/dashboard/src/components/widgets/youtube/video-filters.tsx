import React from "react";
import { VideoFilter } from "@/lib/utils/youtube/types";
import { Film, Radio, Video } from "lucide-react";

interface VideoFiltersProps {
  activeFilter: VideoFilter;
  onFilterChange: (filter: VideoFilter) => void;
  disabled?: boolean;
}

export function VideoFilters({ activeFilter, onFilterChange, disabled }: VideoFiltersProps) {
  const filters: { value: VideoFilter; label: string; icon: React.ReactNode }[] = [
    { value: "all", label: "All", icon: <Video className="w-3.5 h-3.5" /> },
    { value: "video", label: "Videos", icon: <Film className="w-3.5 h-3.5" /> },
    { value: "short", label: "Shorts", icon: <Video className="w-3.5 h-3.5" /> },
    { value: "live", label: "Live", icon: <Radio className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          disabled={disabled}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
            ${
              activeFilter === filter.value
                ? "bg-white text-black"
                : "bg-[#272727] text-[#aaa] hover:bg-[#333] hover:text-white"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {filter.icon}
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  );
}
