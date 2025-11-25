import React from "react";
import { cn } from "@/lib/utils";
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { useAtomValue } from "jotai";
import { useTicker } from "../trading-view/hyperliquid/use-ticker";
import { WsActiveAssetCtx, WsActiveSpotAssetCtx } from "../trading-view/hyperliquid/types";

const coinStats = {
  symbol: "BTC",
  price: "125,029.02",
  priceChange: "+4,201",
  priceChangePercent: "+3.47%",
  indexPrice: "125,029.02",
  high24h: "125,029.02",
  low24h: "125,029.02",
  isPositive: true,
};

function isPerpsTicker(data: WsActiveAssetCtx | WsActiveSpotAssetCtx): data is WsActiveAssetCtx {
  return (data?.ctx as any)?.funding !== undefined;
}

export function Stats() {
  const selectedToken = useAtomValue(selectedTokenAtom);
  const { ticker } = useTicker(selectedToken?.name);

  return (
    <div className="flex-1 relative overflow-hidden min-w-0 max-w-full">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">125,029.02</span>
          <span className={cn("text-sm font-medium", coinStats.isPositive ? "text-[#00C087]" : "text-[#FF4976]")}>
            {coinStats.priceChange}
          </span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">Index Price</span>
          <span className="text-sm font-medium text-white">{coinStats.indexPrice}</span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">24h Change</span>
          <span className="text-sm font-medium text-white">{coinStats.indexPrice}</span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">24H High</span>
          <span className="text-sm font-medium text-white">{coinStats.high24h}</span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">24h Low</span>
          <span className="text-sm font-medium text-white">{coinStats.low24h}</span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">24h Low</span>
          <span className="text-sm font-medium text-white">{coinStats.low24h}</span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">24h Low</span>
          <span className="text-sm font-medium text-white">{coinStats.low24h}</span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">24h Low</span>
          <span className="text-sm font-medium text-white">{coinStats.low24h}</span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">24h Low</span>
          <span className="text-sm font-medium text-white">{coinStats.low24h}</span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">24h Low</span>
          <span className="text-sm font-medium text-white">{coinStats.low24h}</span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">24h Low</span>
          <span className="text-sm font-medium text-white">{coinStats.low24h}</span>
        </div>
      </div>

      {/* {showLeftChevron && (
            <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#121317] to-transparent pointer-events-none flex items-center justify-start pl-2">
              <ChevronLeft className="w-4 h-4 text-[#84858C] opacity-60" />
            </div>
          )}

          {showRightChevron && (
            <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#121317] to-transparent pointer-events-none flex items-center justify-end pr-2">
              <ChevronRight className="w-4 h-4 text-[#84858C] opacity-60" />
            </div>
          )} */}
    </div>
  );
}
