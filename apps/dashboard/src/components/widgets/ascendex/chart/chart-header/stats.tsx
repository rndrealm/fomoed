import React, { Fragment } from "react";
import { cn } from "@/lib/utils";
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { useAtomValue } from "jotai";
import { useTicker } from "../trading-view/hyperliquid/use-ticker";
import { WsActiveAssetCtx, WsActiveSpotAssetCtx } from "../trading-view/hyperliquid/types";
import { RenderIf, SkeletonLoader } from "@/components/shared";
import { number } from "zod";

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

function formatNumber(n: number, decimalPoint?: number, currency = false): string {
  if (!n) return "";

  // Count decimal places in the original number
  const decimalPlaces = n.toString().includes(".") ? n.toString().split(".")[1].length : 0;

  const formattedNum = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPoint || decimalPlaces,
    maximumFractionDigits: decimalPoint || decimalPlaces,
  }).format(n);

  return currency ? `$${formattedNum}` : formattedNum;
}

function calculate24hChange(current: number, previous: number) {
  const _change = current - previous;
  const _percentChange = (_change / previous) * 100;
  const isPositive = _change >= 0;
  const decimalPlaces = current.toString().includes(".") ? current.toString().split(".")[1].length : 0;
  const change = formatNumber(_change, decimalPlaces);
  const percentChange = formatNumber(_percentChange, 2);

  return { change, percentChange, isPositive };
}

function isPerpsTicker(data: WsActiveAssetCtx | WsActiveSpotAssetCtx): data is WsActiveAssetCtx {
  return (data?.ctx as any)?.funding !== undefined;
}

interface IPerpStats {
  data: WsActiveAssetCtx;
}

function PerpStats(props: IPerpStats) {
  const { data } = props;

  const { change, percentChange, isPositive } = calculate24hChange(data?.ctx?.markPx, data?.ctx?.prevDayPx);

  const sign = isPositive ? "+" : "";

  return (
    <div className="flex-1 relative overflow-hidden min-w-0 max-w-full">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">Mark</span>
          <span className={cn("text-sm font-medium", coinStats.isPositive ? "text-[#00C087]" : "text-[#FF4976]")}>
            {formatNumber(data?.ctx?.markPx)}
          </span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">Oracle</span>
          <span className="text-sm font-medium text-white">{formatNumber(data?.ctx?.oraclePx)}</span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">24h Change</span>
          <span className={cn("text-sm font-medium", isPositive ? "text-[#00C087]" : "text-[#FF4976]")}>
            {sign}
            {change} / {sign}
            {percentChange}%
          </span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">24h Volume</span>
          <span className="text-sm font-medium text-white">{formatNumber(data?.ctx?.dayNtlVlm, 2, true)}</span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">Open Interest</span>
          <span className="text-sm font-medium text-white">{formatNumber(data?.ctx?.openInterest, 2, true)}</span>
        </div>
      </div>
    </div>
  );
}

interface ISpotStats {
  data: WsActiveSpotAssetCtx;
}

function SpotStats(props: ISpotStats) {
  const { data } = props;

  const { change, percentChange, isPositive } = calculate24hChange(data?.ctx?.markPx, data?.ctx?.prevDayPx);

  const sign = isPositive ? "+" : "";

  return (
    <div className="flex-1 relative overflow-hidden min-w-0 max-w-full">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">Price</span>
          <span className={cn("text-sm font-medium", coinStats.isPositive ? "text-[#00C087]" : "text-[#FF4976]")}>
            {formatNumber(data?.ctx?.markPx)}
          </span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">24h Change</span>
          <span className={cn("text-sm font-medium", isPositive ? "text-[#00C087]" : "text-[#FF4976]")}>
            {sign}
            {change} / {sign}
            {percentChange}%
          </span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">24h Volume</span>
          <span className="text-sm font-medium text-white">{formatNumber(data?.ctx?.dayNtlVlm, 2)} USDC</span>
        </div>

        <div className="flex flex-col items-end py-[7.5px] px-1 flex-shrink-0">
          <span className="text-xs text-[#84858C] leading-tight mb-0.5">Market Cap</span>
          <span className="text-sm font-medium text-white">
            {formatNumber(data?.ctx?.circulatingSupply * data?.ctx?.markPx, 2)} USDC
          </span>
        </div>
      </div>
    </div>
  );
}

export function Stats() {
  const selectedToken = useAtomValue(selectedTokenAtom);
  const { ticker, isConnected } = useTicker(selectedToken?.name);

  return (
    <Fragment>
      <RenderIf condition={isConnected && !selectedToken?.isSpot}>
        <PerpStats data={ticker as WsActiveAssetCtx} />
      </RenderIf>

      <RenderIf condition={isConnected && !!selectedToken?.isSpot}>
        <SpotStats data={ticker as WsActiveSpotAssetCtx} />
      </RenderIf>

      <RenderIf condition={!isConnected}>
        <SkeletonLoader widthFull heightFull backgroundColor="#121317" borderRadius={0} />
      </RenderIf>
    </Fragment>
  );
}
