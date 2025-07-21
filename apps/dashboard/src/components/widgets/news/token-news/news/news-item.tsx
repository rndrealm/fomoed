import React from "react";
import dashboard from "@/lib/assets/dashboard";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { RenderIf } from "@/components/shared";
import { NewsFeedItem } from "@/services/queries/news/types";
import { formatNewsWidgetTime } from "@/lib/utils";

interface IProps {
  onClick?: () => void;
  sentiment?: "Bullish" | "Bearish";
  data: NewsFeedItem;
}

interface ITag {
  sentiment: "Bullish" | "Bearish";
}

function Tag(props: ITag) {
  const { sentiment } = props;
  return (
    <div className="flex">
      <RenderIf condition={sentiment === "Bullish"}>
        <div className="rounded-[38px] bg-[#1F8B4C] px-3 py-1">
          <p className="text-xs leading-[16px] text-[#E9FBE5]">{sentiment}</p>
        </div>
      </RenderIf>

      <RenderIf condition={sentiment === "Bearish"}>
        <div className="rounded-[38px] bg-[#A33639] px-3 py-1">
          <p className="text-xs leading-[16px] text-[#FDECEC]">{sentiment}</p>
        </div>
      </RenderIf>
    </div>
  );
}

export default function NewsItem(props: IProps) {
  const { data, onClick } = props;

  return (
    <button type="button" className="text-left" onClick={onClick}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          {/* <Tag sentiment={sentiment} /> */}
          <a target="_blank" href={data?.original_url}>
            <p className="line-clamp-1 text-xs leading-[16px] tracking-[-0.4%] text-[#A4A4A4]">{data?.source}</p>
          </a>

          <div className="flex w-full flex-col gap-1">
            <h2 className="line-clamp-2 text-[16px] leading-[24px] font-medium tracking-[-1.5%] text-white">
              {data?.title}
            </h2>
            {/* <p className="line-clamp-2 text-[13px] leading-[18px] font-semibold text-[#A4A4A4]">
            {data?.ai_summary?.[0] || ""}
          </p> */}
          </div>

          <p className="text-xs leading-[16px] tracking-[-0.4%] text-[#A4A4A4]">
            {formatNewsWidgetTime(data?.published_at)}
          </p>
        </div>

        <div className="h-[70px] w-full max-w-[70px] overflow-hidden rounded-[10px]">
          <Image src={data?.image_url || ""} width={90} height={90} alt="news" className="h-full w-full object-cover" />
        </div>
      </div>
    </button>
  );
}
