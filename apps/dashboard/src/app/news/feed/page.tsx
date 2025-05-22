"use client";

import ChevronRight from "@/components/icons/ChevronRight";
import FeedCard from "@/components/news/feed-card";
import PricingCards from "@/components/pricing/pricing-cards";
import { useReadNewslabPosts } from "@/services/queries/news";
import React from "react";

const Feed = () => {
  const { data, isPending } = useReadNewslabPosts();
  return (
    <main className="md:max-w-[45.75rem] mx-auto mt-[6.625rem] pb-[3rem] max-w-[500px] px-4">
      <h1 className="text-2xl font-medium text-white">News Feed</h1>
      {isPending ? (
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
    </main>
  );
};

export default Feed;
