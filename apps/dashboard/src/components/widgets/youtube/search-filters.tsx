import React from "react";
import { SearchFilter } from "@/lib/utils/youtube/types";
import { Video, Users } from "lucide-react";

interface SearchFiltersProps {
  activeFilter: SearchFilter;
  onFilterChange: (filter: SearchFilter) => void;
  disabled?: boolean;
}

export function SearchFilters({ activeFilter, onFilterChange, disabled }: SearchFiltersProps) {
  const filters: { value: SearchFilter; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All', icon: <Video className="w-3.5 h-3.5" /> },
    { value: 'videos', label: 'Videos', icon: <Video className="w-3.5 h-3.5" /> },
    { value: 'channels', label: 'Channels', icon: <Users className="w-3.5 h-3.5" /> },
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
            ${activeFilter === filter.value
              ? 'bg-white text-black'
              : 'bg-[#272727] text-[#aaa] hover:bg-[#333] hover:text-white'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {filter.icon}
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  );
}