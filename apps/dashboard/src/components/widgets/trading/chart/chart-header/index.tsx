"use client";
import React, { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { RenderIf } from "@/components/shared";
import { useAtom } from "jotai";
import { selectedTokenAtom, showSelectTokenModalAtom } from "@/lib/atoms/hyperliquid";
import Image from "next/image";
import { Stats } from "./stats";
import { TokenSelect } from "../../hyperliquid/modals/token-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const getCoinIconUrl = (symbol = "BTC") => {
  return `https://app.hyperliquid.xyz/coins/${symbol}.svg`;
};

export default function ChartHeader() {
  const [showSelectTokenModal, setShowSelectTokenModal] = useAtom(showSelectTokenModalAtom);
  const [selectedToken, setSelectedToken] = useAtom(selectedTokenAtom);

  return (
    <Fragment>
      <div className="h-[72px] bg-[#121317] rounded-[6px] px-1 py-[7.5px] flex items-center gap-2 w-full">
        <div className="flex items-center gap-3 px-[4px] flex-shrink-0">
          <Popover open={showSelectTokenModal} onOpenChange={setShowSelectTokenModal}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-2 hover:bg-[#1a1b1f] px-2 py-1.5 rounded transition-colors"
                type="button"
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

          <div className="w-[47px] h-5 px-2 py-0.5 bg-[#2C233A] border border-[#3A2C4F] rounded flex items-center justify-center">
            <span className="text-[11px] font-medium text-[#C1A8FF]">Perps</span>
          </div>
        </div>

        <Stats />
      </div>
    </Fragment>
  );
}
