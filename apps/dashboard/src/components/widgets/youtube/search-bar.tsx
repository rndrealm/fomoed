import React, { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent, overrideQuery?: string) => void;
  isSearching: boolean;
  suggestions: string[];
  fetchSuggestions: (query: string) => void;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isSearching,
  suggestions,
  fetchSuggestions,
}: SearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const isSelectingSuggestion = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (isSelectingSuggestion.current) {
      return;
    }

    if (debouncedQuery.trim() && debouncedQuery.length > 2) {
      fetchSuggestions(debouncedQuery);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedQuery, fetchSuggestions]);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: string) => {
    isSelectingSuggestion.current = true;

    setSearchQuery(suggestion);
    setShowSuggestions(false);

    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(fakeEvent, suggestion);

    setTimeout(() => {
      isSelectingSuggestion.current = false;
    }, 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isSelectingSuggestion.current = false;
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    isSelectingSuggestion.current = false;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    setShowSuggestions(false);
    handleSearch(e);
  };

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#141414] rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-[#878787]" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0 && searchQuery.length > 2 && !isSelectingSuggestion.current) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Paste YouTube URL or search..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#878787]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-[#878787] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2 bg-[#272727] hover:bg-[#333] rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {isSearching ? "..." : "Go"}
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] rounded-lg border border-[#272727] shadow-lg z-10 overflow-hidden">
          <div className="py-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#272727] transition-colors text-left"
              >
                <Search className="w-4 h-4 text-[#878787] flex-shrink-0" />
                <span className="text-sm text-white flex-1">{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
