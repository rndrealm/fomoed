"use client";

import { useState } from "react";
// import { useQueryState } from "nuqs";

// import NewsMenu from "./NewsMenu";
// import NewsPopup from "./NewsPopup";
// import NewsContent from "./NewsContent";

export function NewsSection() {
    // const [selectedTag, setSelectedTag] = useQueryState("tag", { defaultValue: "All" });
    const [isSearching, setIsSearching] = useState(false);

    // console.log("newsData", newsData);

    return (
        <div className="h-full min-h-[calc(100svh-86px)] w-full pb-4 bg-black">

            {/* {isSearching && (
                <NewsPopup setIsSearching={setIsSearching} />
            )} */}

            {/* <NewsMenu selectedTag={selectedTag} setIsSearching={setIsSearching} setSelectedTag={setSelectedTag} /> */}

            {/* <NewsContent selectedTag={selectedTag} /> */}
        </div>
    );
}
