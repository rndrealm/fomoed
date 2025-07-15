import React from "react";
import TokenPill from "./token-pill";
import Image from "next/image";
import news from "@/lib/assets/news";
import { Bookmark } from "../icons/icons";

const RelatedArticleCard = () => {
  return (
    <div className="mb-3 border-b border-[#212121] pb-4">
      <div className="flex items-center justify-between">
        <TokenPill />
        <Bookmark fill="#5F5F5F" />
      </div>
      <div className="flex items-end justify-between gap-16 pt-1 pb-4">
        <div className="flex-1">
          <h3 className="text-xs text-[#A4A4A4]">Cryptopanic.com</h3>
          <h1 className="pt-1 pb-2 text-lg leading-[1.625rem] font-medium">
            Coinbase announces Tokenized stocks on the EVM chain
          </h1>
          <h3 className="text-xs text-[#A4A4A4]">11:02AM</h3>
        </div>
        <div className="relative h-[5.6875rem] w-[5.6875rem]">
          <Image src={news.newsMock} alt="News mock" className="rounded-[10px]" />
        </div>
      </div>
    </div>
  );
};

const RelatedArticles = () => {
  return (
    <aside>
      <h1 className="text-2xl font-semibold">Related Articles</h1>
      <div className="mt-8">
        {new Array(3).fill(0).map((_, index) => (
          <RelatedArticleCard key={index} />
        ))}
      </div>
    </aside>
  );
};

export default RelatedArticles;
