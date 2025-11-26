"use client";
import React, { useState, useRef, useEffect, Fragment } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";
import { TokenSelect } from "../../modals/token-select";
import { RenderIf } from "@/components/shared";
import { useAtomValue, useSetAtom } from "jotai";
import { selectedTokenAtom, showSelectTokenModalAtom, toggleSelectTokenModalAtom } from "@/lib/atoms/hyperliquid";
import Image from "next/image";
import { useTicker } from "../trading-view/hyperliquid/use-ticker";
import { Stats } from "./stats";

const getCoinIconUrl = (symbol = "BTC") => {
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
  const [showLeftChevron, setShowLeftChevron] = useState(false);
  const [showRightChevron, setShowRightChevron] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const showSelectTokenModal = useAtomValue(showSelectTokenModalAtom);
  const toggleSelectTokenModal = useSetAtom(toggleSelectTokenModalAtom);
  const selectedToken = useAtomValue(selectedTokenAtom);

  // console.log("TICKER", ticker);

  // Dummy stats data
  const coinStats: CoinStats = {
    symbol: "BTC",
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
        <div className="flex items-center gap-3 px-[4px] flex-shrink-0">
          <button
            className="flex items-center gap-2 hover:bg-[#1a1b1f] px-2 py-1.5 rounded transition-colors"
            type="button"
            onClick={() => {
              toggleSelectTokenModal();
            }}
          >
            <div className="w-6 h-6 flex-shrink-0">
              <RenderIf condition={!selectedToken?.isSpot}>
                <Image
                  width={24}
                  height={24}
                  src={getCoinIconUrl(
                    selectedToken?.isSpot ? `${selectedToken?.baseTokenName}_spot` : selectedToken?.baseTokenName,
                  )}
                  alt="Coin Icon"
                  className="w-full h-full rounded-full"
                />
              </RenderIf>
            </div>

            <span className="text-white font-medium text-sm">{selectedToken?.displayName || "BTC-USDC"}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          <div className="w-[47px] h-5 px-2 py-0.5 bg-[#2C233A] border border-[#3A2C4F] rounded flex items-center justify-center">
            <span className="text-[11px] font-medium text-[#C1A8FF]">Perps</span>
          </div>
        </div>

        <Stats />
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
