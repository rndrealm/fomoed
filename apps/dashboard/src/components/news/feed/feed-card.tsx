import { AppRoutes } from "@/lib/routes";
import { timeAgo } from "@/lib/utils";
import { NewsFeedItem } from "@/services/queries/news/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface IProps {
  article: NewsFeedItem;
}

const FeedCard = (props: IProps) => {
  const { article } = props;
  const formattedDate = timeAgo(article.published_at);
  return (
    <Link href={AppRoutes.news.newsPage.path(article.slug || article.id)}>
      <div
        style={{
          gridColumn: `span ${1}`,
          gridRow: `span ${1}`,
          boxShadow: "0px 4px 4px 0px #00000040",
        }}
        className="relative h-[500px] gap-1.5 overflow-hidden rounded-[16px] bg-[#121212] px-4.5 pt-3 pb-3.5 sm:h-[354px]"
      >
        {/* Background image */}
        <div
          // style={{
          //   backgroundImage: `url(${article.image_url || "/fallback.png"})`,
          //   backgroundSize: "cover",
          //   backgroundPosition: "center",
          // }}
          className="absolute inset-0 z-0 rounded-[16px]"
        >
          <Image
            src={article.image_url || "/fallback.png"}
            fill
            alt="News Arcticle image"
            className="rounded-[16px] object-cover"
          />
        </div>

        {/* Blur */}
        <div className="absolute inset-0 z-0 h-full w-[1020%]">
          <div className="gradient-blur">
            <div></div>
            <div></div>
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
          <p className="text-xs font-normal text-[#A4A4A4]">{article.source}</p>
          <p className="text-[18px] leading-[1.2] font-medium text-white">
            {article.title}
          </p>
          <p className="text-[13px] leading-[1.3] font-semibold text-[#A4A4A4]">
            {article.summary}
          </p>
          <p className="mt-1 text-xs font-normal text-[#A4A4A4]">
            {formattedDate}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default FeedCard;
