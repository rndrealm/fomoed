import React from "react";
import Header from "./header";
import Image from "next/image";
import { Close, MarketplaceLink } from "@/components/icons/icons";
import marketplace from "@/lib/assets/signals/community/marketplace";
import { Rating } from "./rating";
import { SignalDetails } from "./signal-details";
import { CreatorDetails } from "./creator-details";
import { images } from "../marketplace-card";
import { marketplaceData } from "@/lib/static";

interface IProps {
  handleClose: () => void;
  index?: number;
}

export function MarketplaceDetails(props: IProps) {
  const { handleClose, index = 0 } = props;
  const itemData = marketplaceData[index % marketplaceData.length];

  return (
    <div className="h-full w-full bg-[#000000] border border-[#282828] rounded-[30px] flex flex-col">
      <div className="flex justify-between items-center px-6 py-2 border-b border-[#141414]">
        <p className="text-[#D4D4D4] text-sm tracking-[-0.4%] leading-[1.35]">
          {itemData?.title || "Marketplace Details"}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-[32px] h-[32px] flex items-center justify-center"
          >
            <MarketplaceLink />
          </button>

          <button
            type="button"
            className="w-[32px] h-[32px] flex items-center justify-center"
            onClick={handleClose}
          >
            <Close />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar pt-4 pb-14">
        <Header index={index} />
        <div className="flex flex-col">
          <div className="px-6">
            <Image
              src={index !== undefined ? images[index] : ""}
              alt="marketplace card"
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="">
            <Rating followers={itemData?.followers} rating={itemData?.rating} />
          </div>
          <div className="flex gap-10 px-18 py-6">
            <SignalDetails index={index} />
            <CreatorDetails author={itemData?.author} />
          </div>
        </div>
      </div>
    </div>
  );
}
