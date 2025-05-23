import React from "react";
import { LinkIcon, Twitter } from "../icons/icons";
import { toast } from "sonner";
import { NewsRowInsert } from "@/services/queries/news/types";
import { formatDate, normalizeHtmlText } from "@/lib/utils";

import Link from "next/link";

interface IProps {
  article: NewsRowInsert;
}

const FeedCard = ({ article }: IProps) => {
  const pathName = `https://dashboard.fomoed.io/news/${article.id}`;
  return (
    <Link href={`/news/${article.id}`} className="block h-full">
      <article className=" border-[#1E1E1E] border-[0.5px] rounded-[20px] font-semibold bg-[#070707] flex flex-col h-full">
        <div className="flex-grow">
          <h1 className="px-5 pt-6 text-lg font-semibold text-white">
            {normalizeHtmlText(article.title)}
          </h1>
          <p className="text-[#919191] text-base font-normal px-5 mb-6 line-clamp-3">
            {normalizeHtmlText(article.summary)}
          </p>
        </div>
        <div className="border-t border-[#1E1E1E] px-5 py-6 flex items-center justify-between">
          <div className="flex items-center text-sm font-semibold">
            <p className="text-white border-r border-[#1E1E1E] pr-2 mr-2">
              By Joshua Jake
            </p>
            <p className="text-[#5F5F5F]">{formatDate(article.published_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${pathName}`}
              target="_blank"
            >
              <button
                type="button"
                onClick={() => {}}
                className="w-[24px] h-[24px] flex items-center justify-center"
              >
                <Twitter />
              </button>
            </a>
            <button
              type="button"
              className="w-[24px] h-[24px] flex items-center justify-center"
              onClick={() => {
                navigator.clipboard
                  .writeText(pathName)
                  .then(() => {
                    toast("Copied!!!", {});
                  })
                  .catch((err) => {
                    console.error("Failed to copy: ", err);
                  });
              }}
            >
              <LinkIcon />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default FeedCard;
