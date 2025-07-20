"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";

import NewsMenu from "./news-menu";
import NewsPopup from "./news-popup";
import NewsContent from "./news-content";

export function NewsSection() {
  const [selectedTag, setSelectedTag] = useQueryState("tag", { defaultValue: "All" });
  const [search] = useQueryState("q", { defaultValue: "" });
  const [isSearching, setIsSearching] = useState(false);

  return (
    <div className="h-full min-h-[calc(100svh-86px)] w-full bg-black pb-4">
      {(!!search || isSearching) && <NewsPopup setIsSearching={setIsSearching} />}

      <NewsMenu selectedTag={selectedTag} setIsSearching={setIsSearching} setSelectedTag={setSelectedTag} />

      <NewsContent isSearching={isSearching} selectedTag={selectedTag} />
    </div>
  );
}
