import React from "react";
import dashboard from "@/lib/assets/dashboard";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { RenderIf } from "@/components/shared";

interface IProps {
  title: string;
  body: string;
  img: StaticImageData;
  source: string;
  onClick?: () => void;
  sentiment: "Bullish" | "Bearish";
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
  const { body, img, source, title, onClick, sentiment } = props;

  return (
    <button type="button" className="flex flex-col gap-1 text-left" onClick={onClick}>
      <Tag sentiment={sentiment} />
      <Link href="#">
        <p className="text-xs leading-[16px] text-[#A4A4A4]">{source}</p>
      </Link>
      <div className="flex justify-between gap-4">
        <div className="flex w-full max-w-[278px] flex-col gap-1">
          <h2 className="line-clamp-2 text-[18px] leading-[26px] font-medium text-white">{title}</h2>
          <p className="line-clamp-2 text-[13px] leading-[18px] font-semibold text-[#A4A4A4]">{body}</p>
        </div>

        <div className="h-full max-h-[90px] w-full max-w-[90px] rounded-[10px]">
          <Image src={img} alt="news" />
        </div>
      </div>

      <p className="text-xs leading-[16px] text-[#A4A4A4]">11:02AM</p>
    </button>
  );
}
