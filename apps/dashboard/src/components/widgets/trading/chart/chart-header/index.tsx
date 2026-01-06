"use client";
import React, { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { RenderIf } from "@/components/shared";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { selectedTokenAtom, showSelectTokenModalAtom } from "@/lib/atoms/hyperliquid";
import Image from "next/image";
import { Stats } from "./stats";
import { TokenSelect } from "../../hyperliquid/modals/token-select";
import { cn } from "@/lib/utils";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const getCoinIconUrl = (symbol = "BTC") => {
  return `https://app.hyperliquid.xyz/coins/${symbol}.svg`;
};

interface IProps {
  widget: LayoutType["widgets"][0];
}

interface ITag {
  isSpot?: boolean;
}

function Tag(props: ITag) {
  const { isSpot = false } = props;

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

function TokenDropdown(props: IProps) {
  const { widget } = props;

  const [showSelectTokenModal, setShowSelectTokenModal] = useAtom(showSelectTokenModalAtom);
  const [selectedToken, setSelectedToken] = useAtom(selectedTokenAtom);

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  return (
    <DropdownMenu modal open={showSelectTokenModal} onOpenChange={setShowSelectTokenModal}>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="p-0 w-[683px] rounded-2xl border-none">
        {showSelectTokenModal && (
          <TokenSelect
            handleSelectToken={(token) => {
              setSelectedToken(token);
              setShowSelectTokenModal(false);
              updateWidgetPropsFromAtom({
                tabId: activeLayout.id,
                widgetId: widget.id,
                widgetProps: {
                  token,
                },
              });
            }}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ChartHeader(props: IProps) {
  const { widget } = props;

  const [selectedToken, setSelectedToken] = useAtom(selectedTokenAtom);

  return (
    <Fragment>
      <div className="h-[72px] bg-[#121317] rounded-[6px] px-1 py-[7.5px] flex items-center gap-2 w-full ">
        <div className="flex items-center gap-3 px-[4px] flex-shrink-0">
          <TokenDropdown widget={widget} />

          <Tag isSpot={selectedToken?.isSpot} />
        </div>

        <Stats />
      </div>
    </Fragment>
  );
}
