"use client";

import SearchIcon from "@/components/icons/SearchIcon";
import { useState } from "react";
import CloseIcon from "@/components/icons/CloseIcon";
import Image from "next/image";

const NoNewsSvg = () => {
    return (
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="186" height="264" transform="translate(124 68)" fill="#0F0F0F" />
            <path d="M0 69H400" stroke="#0F0F0F" strokeWidth="2.5" />
            <path d="M310 400L310 5.00679e-06" stroke="#0F0F0F" strokeWidth="2.5" />
            <path d="M124 400L124 5.00679e-06" stroke="#0F0F0F" strokeWidth="2.5" />
            <path d="M0 332H400" stroke="#0F0F0F" strokeWidth="2.5" />
        </svg>

    )
}

const newsImage = [
    {
        url: "/news-mock0.png",
        articleTitle: "Text to Audio",
        articleDescription: "Articles"
    },
    {
        url: "/news-mock1.png",
        articleTitle: "Isreal-Iran War",
        articleDescription: "50 Articles"
    },
    {
        url: "/news-mock2.png",
        articleTitle: "Isreal-Iran War",
        articleDescription: "50 Articles"
    }
]


const NewsPopup = ({ setIsSearching }: { setIsSearching: (value: boolean) => void }) => {
    const [search, setSearch] = useState("");

    // const filtered = widgets.filter((w) => {
    //     const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase());

    //     const matchesTag = selectedTag === "All" || w.tags.includes(selectedTag);

    //     return matchesSearch && matchesTag;
    // });


    return (
        <div className="absolute z-40 left-0 top-0 w-full min-h-[calc(100svh-86px)] bg-[#000] flex flex-col items-center justify-start">

            <div className="relative h-full w-[75%] xl:w-[55%] mx-auto flex flex-col items-center justify-center pt-8 gap-16">

                <div className="relative w-full flex flex-col items-center">

                    <div className="w-full flex flex-row justify-center items-center gap-20 md-gap-44">
                        {/* Search Input */}
                        <div style={{
                            background: 'linear-gradient(120.75deg, #191919 3.66%, #000000 45.76%, #000000 68.73%, #000000 86.75%, #000000 94.89%, #BD4618 104.37%, #7F7F7F 136.85%)',
                        }}
                            className="relative w-[280px] md:w-[380px] lg:w-[480px] rounded-[12px] bg-[#0C0C0C] border-[1px] border-[#2A2A2A]"
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

                        <button className="absolute right-0" onClick={() => setIsSearching(false)}>
                            <CloseIcon color="#FFF" />
                        </button>
                    </div>
                </div>

                {/* News */}
                <div className="mx-auto px-0 flex flex-row  items-center justify-center flex-wrap gap-5">
                    <div className="flex flex-col items-center justify-center gap-5">
                        {search !== "" ? (
                            <div>
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
                        ) : (
                            <div className="w-full flex flex-col xl:flex-row items-start justify-center gap-5">
                                {newsImage.map((image, index) => (
                                    <div key={index} className="flex flex-col gap-2 w-[280px]">

                                        <div
                                            style={{
                                                backgroundImage: `url(${image.url})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                            }}
                                            className=" w-[280px] h-[280px] rounded-[16px] overflow-hidden border-[1px] border-[#2A2A2A]">
                                            {/* <Image width={270} height={270} src={image.url} alt="news" /> */}
                                        </div>

                                        <div className="flex flex-col gap-2 justify-center">
                                            <h2 className="text-white font-medium text-[18px]">{image.articleTitle}</h2>
                                            <p className="text-xs text-[#A4A4A4] font-normal">
                                                {image.articleDescription}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    )
}

export default NewsPopup