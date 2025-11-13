"use client";
import React, { useState, useRef, useEffect, Fragment } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";
import { TokenSelect } from "../../modals/token-select";
import { RenderIf } from "@/components/shared";
import { useAtomValue, useSetAtom } from "jotai";
import { showSelectTokenModalAtom, toggleSelectTokenModalAtom } from "@/lib/atoms/hyperliquid";
import Image from "next/image";
import { useReadHyperLiquidTokens } from "@/services/queries/hyperliquid";

const getCoinIconUrl = (symbol: string) => {
  return `https://app.hyperliquid.xyz/coins/${symbol}.svg`;
};

interface CoinStats {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  indexPrice: string;
  high24h: string;
  low24h: string;
  isPositive: boolean;
}

export default function ChartHeader() {
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [showLeftChevron, setShowLeftChevron] = useState(false);
  const [showRightChevron, setShowRightChevron] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useReadHyperLiquidTokens();

  const showSelectTokenModal = useAtomValue(showSelectTokenModalAtom);
  const toggleSelectTokenModal = useSetAtom(toggleSelectTokenModalAtom);

  // Dummy stats data
  const coinStats: CoinStats = {
    symbol: selectedCoin,
    price: "125,029.02",
    priceChange: "+4,201",
    priceChangePercent: "+3.47%",
    indexPrice: "125,029.02",
    high24h: "125,029.02",
    low24h: "125,029.02",
    isPositive: true,
  };

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;

    setShowLeftChevron(scrollLeft > 0);

    setShowRightChevron(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();

    container.addEventListener("scroll", checkScrollPosition);

    const resizeObserver = new ResizeObserver(checkScrollPosition);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <Fragment>
      <div className="h-[72px] bg-[#121317] rounded-[6px] px-1 py-[7.5px] flex items-center gap-2 w-full">
        <div className="flex items-center gap-2.5 px-[4px] flex-shrink-0">
          <button
            className="flex items-center gap-2 hover:bg-[#1a1b1f] px-2 py-1.5 rounded transition-colors"
            type="button"
            onClick={() => {
              toggleSelectTokenModal();
            }}
          >
            <div className="w-6 h-6 flex-shrink-0">
              <Image
                width={24}
                height={24}
                src={getCoinIconUrl("BTC")}
                alt="Coin Icon"
                className="w-full h-full rounded-full"
              />
            </div>

            <span className="text-white font-medium text-sm">BTC-USDC</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          <div className="w-[47px] h-5 px-2 py-0.5 bg-[#2C233A] border border-[#3A2C4F] rounded flex items-center justify-center">
            <span className="text-[11px] font-medium text-[#C1A8FF]">Perps</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 relative overflow-hidden min-w-0 max-w-full">
          <div ref={scrollContainerRef} className="flex items-center gap-3 overflow-x-auto no-scrollbar">
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

          {showLeftChevron && (
            <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#121317] to-transparent pointer-events-none flex items-center justify-start pl-2">
              <ChevronLeft className="w-4 h-4 text-[#84858C] opacity-60" />
            </div>
          )}

          {showRightChevron && (
            <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#121317] to-transparent pointer-events-none flex items-center justify-end pr-2">
              <ChevronRight className="w-4 h-4 text-[#84858C] opacity-60" />
            </div>
          )}
        </div>
      </div>

      <RenderIf condition={showSelectTokenModal}>
        <TokenSelect
          handleClose={() => {
            toggleSelectTokenModal(false);
          }}
        />
      </RenderIf>
    </Fragment>
  );
}
