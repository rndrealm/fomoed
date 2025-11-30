import { HyperliquidIcon } from "@/components/icons/icon2";
import { Button } from "@/components/ui/button";
import tradingAssets from "@/lib/assets/dashboard/trading";
import Image from "next/image";
import React from "react";

interface IProps {
  onStart: () => void;
}

const HyperliquidEnd = ({ onStart }: IProps) => {
  return (
    <div className="relative  h-full w-full  bg-[#0A1215] border border-[#222222] overflow-hidden rounded-2xl p-8">
      <div className="absolute -bottom-60 left-1/2 -translate-x-1/2 w-[1208px] h-[847px]">
        <Image src={tradingAssets.hyperliquidMask} fill alt="Hyperliquid mask" />
      </div>

      <div className="relative flex flex-col justify-center items-center ">
        <div className="pt-10 ">
          <h3 className="flex items-center font-medium text-[2rem] text-white gap-2.5">
            <span>Welcome to</span>
            <span className="pt-2">
              <HyperliquidIcon />
            </span>
          </h3>
          <p className="text-[#888888] pt-2 leading-5 text-sm text-center">let’s get you ready to trade.</p>

          <div className="flex justify-center pt-4">
            <Button
              onClick={onStart}
              className="bg-[#51D2C1] cursor-pointer hover:bg-[#51D2C1]  py-2 px-3.5 rounded-md text-[#010101] font-medium text-xs"
            >
              Start Trading
            </Button>
          </div>
        </div>

        <div className="">
          <Image src={tradingAssets.meowdy} width={650} height={650} alt="Hyperliquid cat image" />
        </div>
      </div>
    </div>
  );
};

export default HyperliquidEnd;
