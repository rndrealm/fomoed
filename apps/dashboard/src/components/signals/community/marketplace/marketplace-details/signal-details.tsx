import React from "react";
import { Pricing } from "./pricing";
import { Comments } from "./comments";
import { marketplaceData } from "@/lib/static";

interface IProps {
  index: number;
}

export function SignalDetails(props: IProps) {
  const { index } = props;
  return (
    <div className="flex flex-col gap-8 flex-1">
      <div className="flex flex-col gap-2 max-w-[461px] w-full">
        <h3 className="text-white text-lg leading-[1.35] tracking-[-0.4%] font-medium">
          {index !== undefined
            ? marketplaceData[index % marketplaceData.length]?.title ||
              "Signal Details"
            : "Signal Details"}
        </h3>
        <p className="text-[#D4D4D4] text-sm leading-[1.35] tracking-[-0.4%]">
          {index !== undefined
            ? marketplaceData[index % marketplaceData.length]?.description ||
              "Signal Details"
            : "Signal Details"}
        </p>
      </div>

      <Pricing />

      <Comments />
    </div>
  );
}
