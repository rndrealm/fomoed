"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useTrades } from "../chart/trading-view/hyperliquid/use-trades";
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { useAtomValue } from "jotai";
import { RenderIf, SkeletonLoader } from "@/components/shared";

export default function Trades() {
  const selectedToken = useAtomValue(selectedTokenAtom);
  const { trades, isConnected } = useTrades(selectedToken?.name);

  return (
    <div className="flex flex-col h-full text-xs text-white  rounded-lg overflow-hidden ">
      <div className="grid grid-cols-3 px-3 py-2 text-[#9CA3AF] text-[8px] ">
        <span className="text-center text-white">Price </span>
        <span className="text-center">Qty ({selectedToken?.baseTokenName})</span>
        <span className="text-center">Time</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <RenderIf condition={!isConnected}>
          <SkeletonLoader widthFull heightFull backgroundColor="#121317" borderRadius={0} />
        </RenderIf>

        <RenderIf condition={isConnected}>
          {trades.map((trade, index) => {
            // console.log(trade?.side);

            return (
              <div
                key={index}
                className={cn(
                  "flex justify-between px-3 py-[6px] text-[8px]",
                  trade.side === "B" ? "text-[#00AF58]" : "text-[#DC2626]",
                )}
              >
                <span className="text-center">{trade.px}</span>
                <span className="text-center text-white/80">{trade.sz}</span>
                <div className="flex items-center gap-1">
                  <span className="text-center text-[#9CA3AF]">{new Date(trade.time).toLocaleTimeString()}</span>
                  <a href={`https://app.hyperliquid.xyz/explorer/tx/${trade.hash}`} target="_blank">
                    <div className="w-[12px] h-[12px]"></div>
                  </a>
                </div>
              </div>
            );
          })}
        </RenderIf>
      </div>
    </div>
  );
}
