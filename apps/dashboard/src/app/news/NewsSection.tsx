"use client";

import SearchIcon from "@/components/icons/SearchIcon";
import SoundIcon from "@/components/icons/SoundIcon";
import PlayIcon from "@/components/icons/PlayIcon";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReadInfiniteNewsFeed } from "@/services/queries/news";
import { useQueryState } from "nuqs";
import CloseIcon from "@/components/icons/CloseIcon";
import { timeAgo } from "@/lib/utils";

const NoNewsSvg = () => {
    return (
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="186" height="264" transform="translate(124 68)" fill="#0F0F0F" />
            <path d="M0 69H400" stroke="#0F0F0F" stroke-width="2.5" />
            <path d="M310 400L310 5.00679e-06" stroke="#0F0F0F" stroke-width="2.5" />
            <path d="M124 400L124 5.00679e-06" stroke="#0F0F0F" stroke-width="2.5" />
            <path d="M0 332H400" stroke="#0F0F0F" stroke-width="2.5" />
        </svg>

    )
}


const allTags = ["All", "BTC", "ETH", "SOL", "XRP", "DOGE"];

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin h-10 w-10 border-2 border-white/10 border-opacity-80 rounded-full border-t-transparent" />
);


export function NewsSection() {
    const [search, setSearch] = useState("");

    const [selectedTag, setSelectedTag] = useQueryState("tag", { defaultValue: "All" });
    const [isSearching, setIsSearching] = useState(false);


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
    } = useReadInfiniteNewsFeed(selectedTag === "All" ? undefined : selectedTag);

    // console.log("newsData", newsData);

    useEffect(() => {

        const bottomEl = bottomContainerRef.current;

        if (!bottomEl || !hasNextPage || isFetchingNextPage || isPending) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    // console.log("bottom reached");
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
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, newsData, isPending]);

    return (
        <div className="h-full min-h-[calc(100svh-86px)] w-full pb-4 bg-black">

            {isSearching && (
                <div className="absolute z-50 left-0 top-0 w-full min-h-[calc(100svh-86px)] bg-[#000] flex flex-col items-center justify-start">

                    <div className="relative h-full w-[50%] flex flex-col items-center justify-center pt-8 pr-14 gap-20">

                        <div className="relative w-full flex flex-col items-center">

                            <div className="w-full flex flex-row justify-end items-center gap-44">
                                {/* Search Input */}
                                <div style={{
                                    background: 'linear-gradient(92.75deg, #191919 3.66%, #000000 45.76%, #000000 68.73%, #000000 86.75%, #000000 94.89%, #BD4618 104.37%, #7F7F7F 136.85%)',
                                }}
                                    className="relative w-[480px] rounded-[12px] bg-[#0C0C0C] border-[1px] border-[#2A2A2A]"
                                >
                                    <input
                                        type="text"
                                        placeholder="Search Articles"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full py-2 pr-4 pl-[38px] mb-0.5 text-[#A4A4A4] placeholder:text-xs text-[14px] placeholder:font-normal placeholder:text-[#A4A4A4] outline-none"
                                    />
                                    <div className="bg-[#232323] px-2 py-1.5 rounded-[8px] absolute top-1/2 left-1 -translate-y-[50%]">
                                        <SearchIcon color="#FFF" />
                                    </div>
                                </div>

                                <button onClick={() => setIsSearching(false)}>
                                    <CloseIcon color="#FFF" />
                                </button>
                            </div>
                        </div>

                        {/* News */}
                        <div className="mx-auto px-0 flex flex-row  items-center justify-center flex-wrap gap-5">
                            <div className="flex flex-col items-center justify-center gap-5">
                                <NoNewsSvg />
                                <div className="flex flex-col items-center justify-center gap-1.5">
                                    <p className="font-medium text-base text-white">
                                        Currently have no news Articles
                                    </p>
                                    <p className="text-xs text-[#A4A4A4] font-semibold">
                                        We’re trying to fetch the most recent news for you
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>)}

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

                <div className="flex w-full flex-col items-start justify-center gap-3.5 lg:flex-row lg:items-center lg:gap-4.5">


                    {/* Search Icon */}
                    <div onClick={() => setIsSearching(true)} className="relative flex flex-row items-center justify-center p-2 rounded-[8px] bg-[#0C0C0C] border-[1px] border-[#2A2A2A]">

                        <button className="">
                            <SearchIcon color="#FFF" />
                        </button>
                    </div>

                    {/* Tag filters */}
                    <div className="flex flex-row flex-wrap w-full gap-3 py-2">
                        {allTags.map((tag) => {

                            let stringTag = "Popular"
                            if (tag === "BTC") {
                                stringTag = "Bitcoin"
                            } else if (tag === "ETH") {
                                stringTag = "Ethereum"
                            } else if (tag === "SOL") {
                                stringTag = "Solana"
                            } else if (tag === "XRP") {
                                stringTag = "XRP"
                            } else if (tag === "DOGE") {
                                stringTag = "Dogecoin"
                            }

                            return (

                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    className={`rounded-[10px] px-4.5 py-1 text-[14px] font-bold ${selectedTag === tag ? "bg-[#FF5C02] text-white" : "text-[#C3C3C3] *:bg-black"
                                        }`}
                                >
                                    {stringTag}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="relative w-full">
                {/* Loaders */}
                {(isPending || isFetchingNextPage) &&
                    <div className="absolute z-50 inset-0 w-full h-[calc(100svh-256px)] bg-black flex justify-center items-center">
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
                    {newsData?.map((newsContent, index) => {

                        // const publishedAt = newsContent.published_at;
                        // const date = new Date(publishedAt);
                        // const formattedDate = `${date.toLocaleTimeString('en-US', {
                        //     hour: 'numeric',
                        //     minute: '2-digit',
                        //     hour12: true,
                        //     timeZone: 'GMT'
                        // })} GMT, ${date.toLocaleString('en-US', {
                        //     month: 'long',
                        //     day: 'numeric',
                        //     year: 'numeric',
                        //     timeZone: 'GMT'
                        // })}`;

                        const formattedDate = timeAgo(newsContent.published_at)



                        return (

                            <div
                                key={index}
                                style={{
                                    gridColumn: `span ${1}`,
                                    gridRow: `span ${1}`,
                                    boxShadow: "0px 4px 4px 0px #00000040",
                                }}
                                className="relative h-[500px] gap-1.5 overflow-hidden rounded-[16px] bg-[#121212] px-4.5 pt-3 pb-3.5 sm:h-[354px]"
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
                                <div className="absolute inset-0 z-0 w-[1020%] h-full">
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
                <div style={{ display: isPending ? "none" : "block" }} ref={bottomContainerRef} className="absolute bottom-0 left-0 w-full h-10 bg-transparent">

                </div>
            </div>
        </div>
    );
}
