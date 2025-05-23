"use client";
import React, { useEffect, useState } from "react";
import { LinkIcon, Twitter } from "../icons/icons";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { NewsRowInsert } from "@/services/queries/news/types";
import { formatDate } from "@/lib/utils";

interface IProps {
  article?: NewsRowInsert;
}
export function Footer({ article }: IProps) {
  const [pathName, setPathName] = useState("");

  useEffect(() => {
    setPathName(window.location.href);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-5 border-[#202020] border-t">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium leading-[1.35] text-[14px]">
            JOSHUA JAKE
          </p>

          <div className="h-[25px] w-[1px] bg-[#3C3C3C]"></div>

          <p className="text-[#5F5F5F] font-medium leading-[1.35] text-[14px]">
            {formatDate(article?.published_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-white font-medium leading-[1.35] text-[14px]">
            Share Article
          </p>
          <div className="h-[25px] w-[1px] bg-[#3C3C3C]"></div>
          {/* http://twitter.com/share?text=Im%20Sharing%20on%20Twitter&url=https://stackoverflow.com/users/2943186/youssef-subehi&hashtags=stackoverflow,example,youssefusf */}
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

      <div className="flex justify-center">
        <Link href="/dashboard">
          <button
            type="button"
            className="border border-[#464646] bg-white font-medium text-[12px] leading-[1.5] text-[#0c0c0c] py-2 px-[10px] rounded-md"
          >
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
