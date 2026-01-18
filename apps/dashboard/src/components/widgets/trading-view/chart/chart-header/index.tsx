"use client";
import React, { Fragment, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { RenderIf } from "@/components/shared";
import { useAtom } from "jotai";
import { selectedTokenAtomWidgets, showSelectTokenModalAtom } from "@/lib/atoms/tradingViewWidget";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TokenSelect } from "./token-select";

export const getCoinIconUrl = (symbol = "BTC") => {
  return `https://app.hyperliquid.xyz/coins/${symbol}.svg`;
};

function isMarketOpen(): boolean {
  const now = new Date();
  const day = now.getUTCDay(); 
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();
  const totalMinutes = hour * 60 + minute;

  const isWeekday = day >= 1 && day <= 5;
  const marketOpen = 14 * 60 + 30; 
  const marketClose = 21 * 60; 

  return isWeekday && totalMinutes >= marketOpen && totalMinutes < marketClose;
}

interface ITag {
  isSpot?: boolean;
  isStock?: boolean;
}

function Tag({ isSpot = false, isStock = false }: ITag) {
  if (isStock) {
    const marketIsOpen = isMarketOpen();
    return (
      <div className="flex items-center gap-2">
        <div className="w-[47px] h-5 px-2 py-0.5 bg-[#1A2B1A] border border-[#2D4A2D] rounded flex items-center justify-center">
          <span className="text-[11px] font-medium text-[#4CAF50]">Stock</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("w-2 h-2 rounded-full", marketIsOpen ? "bg-green-500" : "bg-gray-500")} />
          <span className={cn("text-[10px] font-medium", marketIsOpen ? "text-green-500" : "text-gray-500")}>
            {marketIsOpen ? "Market Open" : "Market Closed"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-[47px] h-5 px-2 py-0.5 bg-[#2C233A] border border-[#3A2C4F] rounded flex items-center justify-center",
        isSpot && "bg-[#2E241F]",
      )}
    >
      <span className={cn("text-[11px] font-medium text-[#C1A8FF]", isSpot && "text-[#C97038]")}>
        {isSpot ? "Spot" : "Perps"}
      </span>
    </div>
  );
}

export default function ChartHeader() {
  const [showSelectTokenModal, setShowSelectTokenModal] = useAtom(showSelectTokenModalAtom);
  const [selectedToken, setSelectedToken] = useAtom(selectedTokenAtomWidgets);

  const isStock = selectedToken?.type === "stock";
  const isCrypto = selectedToken?.type === "crypto" || !selectedToken?.type;

  const displayName = useMemo(() => {
    if (isStock) {
      return selectedToken?.symbol || "AAPL";
    }
    return selectedToken?.displayName || "BTC-USDC";
  }, [selectedToken, isStock]);

  const cryptoToken = isCrypto ? selectedToken : null;

  return (
    <Fragment>
      <div className="h-[50px] bg-[#121317] rounded-[6px] px-1 flex items-center w-full">
        <div className="flex items-center gap-3 px-[4px]">
          <Popover open={showSelectTokenModal} onOpenChange={setShowSelectTokenModal}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-2 hover:bg-[#1a1b1f] px-2 py-1.5 rounded transition-colors"
                type="button"
              >
                <RenderIf condition={isCrypto && !selectedToken?.isSpot}>
                  <div className="w-6 h-6 flex-shrink-0">
                    <Image
                      width={24}
                      height={24}
                      src={
                        cryptoToken
                          ? getCoinIconUrl(
                              cryptoToken.isSpot ? `${cryptoToken.baseTokenName}_spot` : cryptoToken.baseTokenName,
                            )
                          : ""
                      }
                      alt="Coin Icon"
                      className="w-full h-full rounded-full"
                    />
                  </div>
                </RenderIf>

                <span className="text-white font-medium text-sm">{displayName}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </PopoverTrigger>

            <PopoverContent align="start" className="p-0 w-[683px] rounded-2xl border-none">
              <TokenSelect
                handleSelectToken={(token) => {
                  setSelectedToken(token);
                  setShowSelectTokenModal(false);
                }}
              />
            </PopoverContent>
          </Popover>

          <Tag isSpot={isCrypto ? selectedToken?.isSpot : false} isStock={isStock} />
        </div>
      </div>
    </Fragment>
  );
}
