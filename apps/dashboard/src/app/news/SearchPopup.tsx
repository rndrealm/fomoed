"use client";

import SearchIcon from "@/components/icons/SearchIcon";
import SoundIcon from "@/components/icons/SoundIcon";
import PlayIcon from "@/components/icons/PlayIcon";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useReadInfiniteNewsFeed } from "@/services/queries/news";

const widgets = [
    {
        url: "Cryptopanic.com",
        title: "Coinbase announces Tokenized stocks on the EVM chain",
        content:
            "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
        time: "11:02AM",
        tags: ["Popular", "Bitcoin", "all"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1,
    },
    {
        url: "Cryptopanic.com",
        title: "Ethereum reaches new highs in bullish market",
        content: "Ethereum leads the bull run as prices soar...",
        time: "10:30AM",
        tags: ["Bullish", "Ethereum", "All"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1,
    },
    {
        url: "Cryptopanic.com",
        title: "Bitcoin adoption grows in South America",
        content: "Mass adoption is increasing in developing countries...",
        time: "9:45AM",
        tags: ["Bitcoin", "Popular", "All"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1,
    },
    {
        url: "Cryptopanic.com",
        title: "Market cools off after bull rally",
        content: "Analysts predict sideways movement after massive gains...",
        time: "8:15AM",
        tags: ["Bearish", "All"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1,
    },
    {
        url: "Cryptopanic.com",
        title: "Coinbase announces Tokenized stocks on the EVM chain",
        content:
            "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
        time: "11:02AM",
        tags: ["Popular", "Bearish", "all"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1,
    },
    {
        url: "Cryptopanic.com",
        title: "Coinbase announces Tokenized stocks on the EVM chain",
        content:
            "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
        time: "11:02AM",
        tags: ["Bullish", "Bitcoin", "all"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1,
    },
    {
        url: "Cryptopanic.com",
        title: "Coinbase announces Tokenized stocks on the EVM chain",
        content:
            "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
        time: "11:02AM",
        tags: ["Bitcoin", "all"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1,
    },
    {
        url: "Cryptopanic.com",
        title: "Coinbase announces Tokenized stocks on the EVM chain",
        content:
            "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
        time: "11:02AM",
        tags: ["Popular", "all"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1,
    },
    {
        url: "Cryptopanic.com",
        title: "Coinbase announces Tokenized stocks on the EVM chain",
        content:
            "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
        time: "11:02AM",
        tags: ["Bullish", "all"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1,
    },
];

const allTags = ["All", "Popular", "Bullish", "Bearish", "Bitcoin", "Ethereum"];

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin h-10 w-10 border-2 border-white/10 border-opacity-80 rounded-full border-t-transparent" />
);


export function SearchPopup() {
    const [search, setSearch] = useState("");
    const [selectedTag, setSelectedTag] = useState("All");

    // const filtered = widgets.filter((w) => {
    //     const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase());

    //     const matchesTag = selectedTag === "All" || w.tags.includes(selectedTag);

    //     return matchesSearch && matchesTag;
    // });

    const bottomContainerRef = useRef(null);

    const {
        data: newsData,
        isPending,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        error,
    } = useReadInfiniteNewsFeed();


    useEffect(() => {
        const bottomEl = bottomContainerRef.current;

        if (!bottomEl || !hasNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetchingNextPage) {
                    console.log("bottom reached");
                    fetchNextPage();
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 1.0,
            }
        );

        observer.observe(bottomEl);

        return () => {
            if (bottomEl) observer.unobserve(bottomEl);
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, newsData]);



    const filteredNewsItems = useMemo(() => {

        const itemsWithTags = newsData.map((item: any, index) => {

            if (item?.tagIsSet) return item;

            // const shouldAssignTag = index % 2 === 0;

            const i = (Math.max(1, index % allTags.length));
            const randomTag = allTags[i];
            const randomTag2 = allTags[i - 1];

            console.log("shouldAssignTag:", randomTag, randomTag2);
            return {
                ...item,
                tags: ["All", randomTag, randomTag2],
                tagIsSet: true
            };

        });


        // console.log("itemsWithTags:", itemsWithTags);;

        return itemsWithTags.filter((item) => item.tags?.includes(selectedTag));

    }, [newsData, selectedTag])

    // console.log("filteredNewsItems:", newsData);

    return (
        <div className="h-full min-h-[100svh] pb-4 bg-black">

            <div className="relative flex flex-col items-start justify-between gap-2.5 pb-4">

                <div className="absolute top-2 right-0 flex translate-y-0 flex-row gap-1.5 rounded-[40px] bg-[#2A2A2A] px-3.5 py-2.5 lg:top-1/2 lg:-translate-y-1/2">
                    <button>
                        <PlayIcon />
                    </button>

                    <button>
                        <SoundIcon />
                    </button>
                </div>

                <h2 className="text-[2.25rem] font-bold text-white">Popular</h2>

                <div className="flex w-full flex-col items-start justify-center gap-3.5 lg:flex-row lg:items-center lg:gap-6">
                    {/* Search input */}

                    <div className="relative w-[300px]">
                        <input
                            type="text"
                            placeholder="Search Articles"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border-[#2A2A2A w-full rounded-[8px] border-[1px] bg-[#0C0C0C] py-2 pr-4 pl-[40px] text-white placeholder:text-xs placeholder:font-normal placeholder:text-white"
                        />
                        <div className="absolute top-1/2 left-6 -translate-x-1/2 -translate-y-[40%]">
                            <SearchIcon color="#FFF" />
                        </div>
                    </div>

                    {/* Tag filters */}
                    <div className="flex flex-row flex-wrap w-full gap-4 py-2">
                        {allTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`rounded-[10px] px-4.5 py-1 text-[14px] font-bold ${selectedTag === tag ? "bg-[#FF5C02] text-white" : "text-[#C3C3C3] *:bg-black"
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative min-h-[100svh] w-full">
                {/* Loaders */}
                {isPending &&
                    <div className="absolute z-50 inset-0 w-full h-[calc(100vh-10rem)] bg-black flex justify-center items-center">
                        <LoadingSpinner />
                    </div>
                }
                {/* {isFetchingNextPage &&
                    <div className="fixed z-50 inset-0 w-full h-screen bg-black flex items-center">
                        <LoadingSpinner />
                    </div>
                } */}

                {/* Filtered widgets */}
                <div className="flex flex-col w-full gap-5 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
                    {filteredNewsItems?.map((newsContent, index) => {

                        const publishedAt = newsContent.published_at;
                        const date = new Date(publishedAt);
                        const formattedDate = `${date.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                            // timeZone: 'GMT'
                        })} GMT, ${date.toLocaleString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            timeZone: 'GMT'
                        })}`;

                        // if (index == 0 || index == 6) {
                        //     newsContent.image_url = null
                        // }

                        return (

                            <div
                                key={index}
                                style={{
                                    gridColumn: `span ${1}`,
                                    gridRow: `span ${1}`,
                                    boxShadow: "0px 4px 4px 0px #00000040",
                                }}
                                className="relative h-[500px] gap-1.5 overflow-hidden rounded-[2px] bg-[#121212] px-4.5 pt-3 pb-3.5 sm:h-[354px]"
                            >
                                {/* Background image */}
                                <div
                                    style={{
                                        backgroundImage: `url(${newsContent.image_url || '/fallback.png'})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                    className="absolute inset-0 z-0 rounded-[16px]"
                                ></div>

                                {/* Blur */}
                                <div className="absolute inset-0 z-0 w-full h-full">
                                    <div className="gradient-blur">
                                        <div></div>
                                        <div></div>
                                        {/* <div></div> */}
                                        {/* <div></div> */}
                                        {/* <div></div> */}
                                        {/* <div></div> */}
                                    </div>
                                </div>

                                {/* Dark */}

                                <div
                                    className="absolute inset-0 z-0 w-full h-full"
                                    style={{
                                        background: `linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0) 0%,
          rgba(0, 0, 0, 0.125) 12.56%,
          rgba(0, 0, 0, 0.325) 32.33%,
          rgba(0, 0, 0, 0.5) 45.58%,
          rgba(0, 0, 0, 1) 100%
        )`,
                                    }}
                                />

                                <div className="relative z-[7] flex h-full w-[85%] flex-col items-start justify-end gap-1.5">
                                    <p className="text-xs font-normal text-[#A4A4A4]">{newsContent.source}</p>
                                    <p className="text-[18px] leading-[1.2] font-medium text-white">{newsContent.title}</p>
                                    <p className="text-[13px] leading-[1.3] font-semibold text-[#A4A4A4]">{newsContent.summary}</p>
                                    <p className="mt-1 text-xs font-normal text-[#A4A4A4]">{formattedDate}</p>

                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* BottomContainer */}
                <div ref={bottomContainerRef} className="absolute bottom-0 left-0 w-full h-10 bg-transparent">
                    g
                </div>
            </div>
        </div>
    );
}
