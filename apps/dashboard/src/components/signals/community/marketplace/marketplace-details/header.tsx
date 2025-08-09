import React from "react";
import { Crown, RatingStar } from "@/components/icons/icons";

export default function Header() {
  return (
    <div className="flex justify-between items-center px-6 ">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-[2px]">
          <div className="w-[24px] h-[24px] flex items-center justify-center ">
            <Crown fill="#E4BD18" />
          </div>
          <p className="text-[#989898] text-lg leading-[1.35] tracking-[-0.4%] font-medium">
            Noah Shiffman’s Liquidity threshold Indicator
          </p>
        </div>

        <div className="flex gap-1">
          <div className="px-2 py-1 rounded-md bg-[#181818]">
            <p className="text-[#F5F5F5] text-[10px] leading-[1.35] tracking-[-0.4%] text-uppercase font-medium">
              LIQUIDITY THRESHOLD
            </p>
          </div>

          <div className="px-2 py-1 rounded-md bg-[#181818]">
            <p className="text-[#F5F5F5] text-[10px] leading-[1.35] tracking-[-0.4%] text-uppercase font-medium">
              LIQUIDITY HEAT MAP
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <button className="h-[32px] flex items-center justify-center bg-white rounded-sm px-3">
          <p className="text-[#0D0D0D] text-sm leading-[1.35] tracking-[-0.4%]">
            Purchase Signal
          </p>
        </button>
        <button className="w-[32px] h-[32px] flex items-center justify-center border border-[#232323] rounded-sm">
          <RatingStar />
        </button>
      </div>
    </div>
  );
}
