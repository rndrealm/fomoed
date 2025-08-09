import React from "react";
import { Pricing } from "./pricing";
import { Comments } from "./comments";
import { marketplaceData } from "@/lib/static";

interface IProps {
  index: number;
}

export function SignalDetails(props: IProps) {
  const { index } = props;
  const itemData = marketplaceData[index % marketplaceData.length];
  const title = itemData?.title || "Signal Details";

  return (
    <div className="flex flex-col gap-8 flex-1">
      <div className="flex flex-col gap-2 max-w-[461px] w-full">
        <h3 className="text-white text-lg leading-[1.35] tracking-[-0.4%] font-medium">
          {title}
        </h3>
        <p className="text-[#D4D4D4] text-sm leading-[1.35] tracking-[-0.4%]">
          {itemData?.description || "Signal Details"}
        </p>
      </div>

      <Pricing title={title} />

      <Comments />
    </div>
  );
}
