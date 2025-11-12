"use client";
import React, { useState } from "react";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { WidgetWrapper } from "../shared";
import { AnimatePresence } from "motion/react";
import { SearchBar } from "./search-bar";
import { SearchResults } from "./search-result";
import { VideoPlayer } from "./video-player";
import { InfoModal } from "./info-modals";
import { SearchFilters } from "./search-filters";
import { ChannelDetail } from "./channel-detail";
import { useYoutubeSearch } from "@/lib/utils/youtube/use-youtube-search";

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function YoutubeWidget(props: IProps) {
  const { widget } = props;
  const [showInfo, setShowInfo] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  const videoId = widget?.props?.videoId;
  const showSearch = widget?.props?.showSearch || false;

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    suggestions,
    isSearching,
    error,
    setError,
    handleSearch,
    searchFilter,
    handleSearchFilterChange,
    fetchSuggestions,
  } = useYoutubeSearch(widget, activeLayout, updateWidgetPropsFromAtom);

  const selectVideo = (videoId: string) => {
    if (!videoId || videoId.trim() === "") {
      setError("Invalid video selected.");
      return;
    }

    updateWidgetPropsFromAtom({
      tabId: activeLayout.id,
      widgetId: widget.id,
      widgetProps: {
        ...widget.props,
        videoId: videoId,
        showSearch: false,
      },
    });
    setSearchResults([]);
    setSearchQuery("");
    setError(null);
    setSelectedChannelId(null);
  };

  const selectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
  };

  const handleBackFromChannel = () => {
    setSelectedChannelId(null);
  };

  if (selectedChannelId) {
    return (
      <WidgetWrapper title="YOUTUBE" widget={widget} handleLearnMore={() => setShowInfo(true)}>
        <div className="flex flex-col h-full">
          <ChannelDetail channelId={selectedChannelId} onBack={handleBackFromChannel} onSelectVideo={selectVideo} />
        </div>

        <AnimatePresence>{showInfo && <InfoModal onClose={() => setShowInfo(false)} />}</AnimatePresence>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper title="YOUTUBE" widget={widget} handleLearnMore={() => setShowInfo(true)}>
      <div className="flex flex-col gap-3 h-full">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          isSearching={isSearching}
          suggestions={suggestions}
          fetchSuggestions={fetchSuggestions}
        />

        {showSearch && searchResults.length > 0 && (
          <SearchFilters activeFilter={searchFilter} onFilterChange={handleSearchFilterChange} disabled={isSearching} />
        )}

        {error && (
          <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex-1 rounded-lg overflow-hidden bg-black">
          {showSearch && searchResults.length > 0 ? (
            <SearchResults searchResults={searchResults} selectVideo={selectVideo} selectChannel={selectChannel} />
          ) : videoId ? (
            <VideoPlayer videoId={videoId} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#878787] text-sm">
              Search a YouTube video to get started
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>{showInfo && <InfoModal onClose={() => setShowInfo(false)} />}</AnimatePresence>
    </WidgetWrapper>
  );
}
