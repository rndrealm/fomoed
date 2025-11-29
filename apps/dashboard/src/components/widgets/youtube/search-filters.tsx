import React from "react";
import { SearchFilter } from "@/lib/utils/youtube/types";
import { Video, Radio, Users, SlidersHorizontal } from "lucide-react";

interface SearchFiltersProps {
  activeFilter: SearchFilter;
  onFilterChange: (filter: SearchFilter) => void;
  onOpenAdvancedFilters: () => void;
  disabled?: boolean;
}

export function SearchFilters({ activeFilter, onFilterChange, onOpenAdvancedFilters, disabled }: SearchFiltersProps) {
  const filters: { value: SearchFilter; label: string; icon: React.ReactNode }[] = [
    { value: "all", label: "All", icon: <Video className="w-3.5 h-3.5" /> },
    { value: "video", label: "Videos", icon: <Video className="w-3.5 h-3.5" /> },
    { value: "short", label: "Shorts", icon: <Video className="w-3.5 h-3.5" /> },
    { value: "live", label: "Live", icon: <Radio className="w-3.5 h-3.5" /> },
    { value: "channel", label: "Channels", icon: <Users className="w-3.5 h-3.5" /> },
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

      <button
        onClick={onOpenAdvancedFilters}
        disabled={disabled}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
          bg-[#272727] text-[#aaa] hover:bg-[#333] hover:text-white border border-[#3a3a3a]
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Filters</span>
      </button>
    </div>
  );
}
