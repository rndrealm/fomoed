import React from "react";
import { MarketplaceProfile, RatingStar } from "@/components/icons/icons";

export function Rating() {
  return (
    <div className="flex justify-between items-center px-18 py-[18px] border-b border-[#1E1E1E]">
      <div className="flex items-center gap-1">
        <div className="w-[24px] h-[24px] flex items-center justify-center">
          <MarketplaceProfile />
        </div>

        <p className="text-[#737373] font-xs leading-[20px] ">690</p>

        <div className="w-[3px] h-[3px] bg-[#737373] rounded-full"></div>

        <div className="flex items-center">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="w-[18px] h-[18px] flex items-center justify-center"
              >
                <RatingStar />
              </div>
            ))}
        </div>
      </div>

      <button className="h-[32px] border border-[#232323] rounded-sm px-3">
        <p className="text-[#737373] text-sm leading-[1.35] tracking-[-0.4%]">
          Use on Widgets
        </p>
      </button>
    </div>
  );
}
