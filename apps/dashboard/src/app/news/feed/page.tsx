"use client";
import FeedCard from "@/components/news/feed-card";
import dashboard from "@/lib/assets/dashboard";
import { cn } from "@/lib/utils";
import {
  useFetchTokenNews,
  useReadNewslabPosts,
} from "@/services/queries/news";
import Image from "next/image";
import React, { useState } from "react";

const Feed = () => {
  const { isPending: newsIsPending } = useFetchTokenNews();

  const [page, setPage] = useState(1);

  const { data, isPending, meta } = useReadNewslabPosts(page);

  const handleNext = () => {
    if (page < Math.floor(meta.count / meta.limit)) {
      setPage((prev) => prev + 1);
    }
  };
  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <main className="md:max-w-[45.75rem] mx-auto mt-[6.625rem] pb-[3rem] max-w-[500px] px-4">
      <h1 className="text-2xl font-medium text-white">News Feed</h1>
      {isPending || newsIsPending ? (
        <div className="grid grid-cols-1 gap-5 pt-6 md:grid-cols-2">
          {new Array(6).fill(0).map((_, i) => {
            return (
              <div
                key={i}
                className="w-full h-[231px] border-[#1E1E1E] border-[0.5px] rounded-[20px]  bg-[#070707]  animate-pulse"
              />
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 pt-6 md:grid-cols-2">
          {data?.map((article, i) => {
            return <FeedCard key={i} article={article} />;
          })}
        </div>
      )}
      <div className="flex items-center justify-center mt-6">
        <button
          className={cn("pl-2 rotate-180", {
            "opacity-50": page === 1,
          })}
          onClick={handlePrev}
        >
          <Image src={dashboard.right} alt="Left icon" />
        </button>
        {new Array(Math.floor(meta.count / meta.limit) || 1)
          .fill(0)
          .map((_, i) => {
            // const isShow = i + 1 <= 3 || i + 1 > meta.count - 1;
            const isShow =
              Math.abs(i + 1 - page) <= 2 ||
              i + 1 === 1 ||
              i + 1 === meta.count;
            return isShow ? (
              <button
                key={i}
                onClick={() => {
                  setPage(i + 1);
                }}
                className={cn(
                  "text-[#7A7A7A] px-[10px] py-[2px] font-semibold text-base rounded-[4px] mx-1",
                  {
                    "bg-[#232323] text-white": page === i + 1,
                  }
                )}
              >
                {i + 1}
              </button>
            ) : (
              <p className="text-[#7A7A7A]" key={i}>
                .
              </p>
            );
          })}
        <button
          className={cn("pl-2 ", {
            "opacity-50": page === Math.floor(meta.count / meta.limit),
          })}
          onClick={handleNext}
        >
          <Image src={dashboard.right} alt="Left icon" />
        </button>
      </div>
    </main>
  );
};

export default Feed;
