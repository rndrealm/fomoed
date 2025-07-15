"use client";

import SearchIcon from "@/components/icons/SearchIcon";
import SoundIcon from "@/components/icons/SoundIcon";
import PlayIcon from "@/components/icons/PlayIcon";
import { useState } from "react";
import Image from "next/image";

const widgets = [
    {
        url: "Cryptopanic.com",
        title: "Coinbase announces Tokenized stocks on the EVM chain",
        content: "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
        time: "11:02AM",
        tags: ["Popular", "Bitcoin", "all"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1
    },
    {
        url: "Cryptopanic.com",
        title: "Ethereum reaches new highs in bullish market",
        content: "Ethereum leads the bull run as prices soar...",
        time: "10:30AM",
        tags: ["Bullish", "Ethereum", "All"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1
    },
    {
        url: "Cryptopanic.com",
        title: "Bitcoin adoption grows in South America",
        content: "Mass adoption is increasing in developing countries...",
        time: "9:45AM",
        tags: ["Bitcoin", "Popular", "All"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1
    },
    {
        url: "Cryptopanic.com",
        title: "Market cools off after bull rally",
        content: "Analysts predict sideways movement after massive gains...",
        time: "8:15AM",
        tags: ["Bearish", "All"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1
    },
    {
        url: "Cryptopanic.com",
        title: "Coinbase announces Tokenized stocks on the EVM chain",
        content: "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
        time: "11:02AM",
        tags: ["Popular", "Bearish", "all"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1
    },
    {
        url: "Cryptopanic.com",
        title: "Coinbase announces Tokenized stocks on the EVM chain",
        content: "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
        time: "11:02AM",
        tags: ["Bullish", "Bitcoin", "all"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1
    },
    {
        url: "Cryptopanic.com",
        title: "Coinbase announces Tokenized stocks on the EVM chain",
        content: "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
        time: "11:02AM",
        tags: ["Bitcoin", "all"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1
    },
    {
        url: "Cryptopanic.com",
        title: "Coinbase announces Tokenized stocks on the EVM chain",
        content: "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
        time: "11:02AM",
        tags: ["Popular", "all"],
        imageUrl: "/coinbase.png",
        colSpan: 2,
        rowSpan: 1
    },
    {
        url: "Cryptopanic.com",
        title: "Coinbase announces Tokenized stocks on the EVM chain",
        content: "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
        time: "11:02AM",
        tags: ["Bullish", "all"],
        imageUrl: "/coinbase.png",
        colSpan: 1,
        rowSpan: 1
    },
];

const allTags = ["All", "Popular", "Bullish", "Bearish", "Bitcoin", "Ethereum"];


export function SearchPopup() {
    const [search, setSearch] = useState("");
    const [selectedTag, setSelectedTag] = useState("All");

    const filtered = widgets.filter((w) => {
        const matchesSearch =
            w.title.toLowerCase().includes(search.toLowerCase())

        const matchesTag =
            selectedTag === "All" || w.tags.includes(selectedTag);

        return matchesSearch && matchesTag;
    });

    return (
        <div className="h-full pb-4  bg-black ">

            <div className="relative flex flex-col gap-2.5 items-start justify-between pb-4">

                <div className="absolute right-0 top-2 lg:top-1/2 translate-y-0  lg:-translate-y-1/2 bg-[#2A2A2A] rounded-[40px]
                flex flex-row gap-1.5 px-3.5 py-2.5
                ">
                    <button>

                        <PlayIcon />
                    </button>

                    <button>

                        <SoundIcon />
                    </button>
                </div>

                <h2 className="text-[2.25rem] font-bold text-white">
                    Popular
                </h2>

                <div className="w-full flex flex-col lg:flex-row gap-3.5 lg:gap-6 items-start lg:items-center justify-center">
                    {/* Search input */}

                    <div className="relative w-[300px]">
                        <input
                            type="text"
                            placeholder="Search Articles"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-[40px] pr-4 py-2 border-[1px] border-[#2A2A2A bg-[#0C0C0C] rounded-[8px]
                             text-white placeholder:text-white placeholder:text-xs placeholder:font-normal"
                        />
                        <div className="absolute left-6 top-1/2 -translate-x-1/2 -translate-y-[40%]">
                            <SearchIcon color="#FFF" />
                        </div>
                    </div>

                    {/* Tag filters */}
                    <div className="w-full flex flex-row flex-wrap gap-4 py-2">
                        {allTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-4.5 py-1 rounded-[10px] text-[14px] font-bold ${selectedTag === tag
                                    ? "bg-[#FF5C02] text-white"
                                    : "*:bg-black text-[#C3C3C3]"
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                </div>
            </div>

            <div className="relative w-full">

                {/* Filtered widgets */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-4 w-full">
                    {filtered.map((w, index) => (
                        <div
                            key={index}
                            style={{
                                gridColumn: `span ${w.colSpan}`,
                                gridRow: `span ${w.rowSpan}`,
                                boxShadow: "0px 4px 4px 0px #00000040",
                            }}
                            className="relative h-[500px] sm:h-[354px] rounded-[2px] px-4.5 pt-3 pb-3.5 gap-1.5
                            bg-[#121212] overflow-hidden
                            "
                        >


                            {/* Background image */}
                            <div
                                style={{
                                    backgroundImage: `url(${w.imageUrl})`,
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
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                            </div>

                            {/* Dark */}

                            <div className="absolute inset-0 z-0 w-full h-full"
                                style={{
                                    background: `linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0) 0%,
          rgba(0, 0, 0, 0.125) 12.56%,
          rgba(0, 0, 0, 0.325) 32.33%,
          rgba(0, 0, 0, 0.5) 45.58%,
          rgba(0, 0, 0, 1) 100%
        )`
                                }}
                            />


                            <div className="relative z-10 h-full w-[85%] flex flex-col justify-end items-start gap-1.5">

                                <p className="font-normal text-xs text-[#A4A4A4]">
                                    {w.url}
                                </p>
                                <p className="font-medium text-[18px] text-white leading-[1.2]">{w.title}</p>
                                <p className="font-semibold text-[13px] text-[#A4A4A4] leading-[1.3]">
                                    {w.content}
                                </p>
                                <p className="mt-1 font-normal text-xs text-[#A4A4A4]">
                                    {w.time}
                                </p>

                                {/* <div className="mt-2 flex flex-wrap gap-1">
                                {w.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="bg-gray-100 px-2 py-0.5 text-xs rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div> */}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}
