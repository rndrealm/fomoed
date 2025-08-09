import React from "react";
import Image from "next/image";
import marketplace from "@/lib/assets/signals/community/marketplace";
import { Profile } from "./profile";
import { marketplaceData } from "@/lib/static";
import { MarketplaceIcon } from "@/components/icons/icons";
import { RenderIf } from "@/components/shared";

const images = [marketplace.marketplaceCard, marketplace.marketplaceCard2];

interface IProps {
  index?: number;
  data: (typeof marketplaceData)[0];
  onClick?: () => void;
}

export function MarketplaceCard(props: IProps) {
  const { data, index, onClick } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex gap-4 flex-col text-left"
    >
      <div className="bg-[#181818] rounded-lg h-[280px] relative ">
        <RenderIf condition={index !== undefined}>
          <Image
            src={index !== undefined ? images[index % images.length] : ""}
            alt="marketplace card"
            className="h-full w-full object-cover"
          />
        </RenderIf>
        <div className="absolute top-[16px] left-[16px] w-[24px] h-[24px] flex items-center justify-center shadow-[inset_1px_1px_0px_0px_#FFFFFF73] bg-[#5754DC]">
          <MarketplaceIcon />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-[#fff] text-lg tracking-[-0.4%] leading-[1.35] font-medium line-clamp-1">
          {data?.title}
        </h4>
        <p className="text-[#D4D4D4] text-sm line-clamp-3 tracking-[-0.4%] leading-[1.35]">
          {data?.description}
        </p>

        <Profile data={data} index={index} />
      </div>
    </button>
  );
}
