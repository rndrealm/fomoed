import React, { memo } from "react";
import Star from "@/components/icons/Star";
import { cn, hyperliquidFormatPriceChange } from "@/lib/utils";
import { PerpUniverse, SpotsUniverse } from "@/services/queries/hyperliquid/types";
import { Token } from "./token";

interface ITokenRowProps {
  item: PerpUniverse | SpotsUniverse;
  onSelect: (token: PerpUniverse | SpotsUniverse) => void;
  height: string;
  transform: string;
}

export const TokenRow = memo(function TokenRow(props: ITokenRowProps) {
  const { item, onSelect: handleSelectToken, height, transform } = props;
  const _openInterest =
    parseFloat(item?.priceVolume?.openInterest || "0") * parseFloat(item?.priceVolume?.markPx || "0");

  const { priceChange, priceChangePercent, currentPrice, volume, isPositive, openInterest } =
    hyperliquidFormatPriceChange(
      item?.priceVolume?.midPx || 0,
      item?.priceVolume?.prevDayPx || 0,
      item?.priceVolume?.dayNtlVlm || 0,
      _openInterest,
    );

  const priceSymbol = isPositive ? "+" : "";

  return (
    <tr
      key={item?.name}
      className="hover:bg-[#1A1A1C] transition-colors"
      onClick={() => {
        handleSelectToken(item);
      }}
      style={{
        height,
        transform,
      }}
    >
      <td className="py-3 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap text-[#FAFAFA] bordr-r border-[#2D2D2D]">
        <button
          type="button"
          onClick={(e) => {
            e?.stopPropagation();
          }}
        >
          <div className="w-[20px] h-[20px] flex items-center justify-center">
            <Star />
          </div>
        </button>
      </td>
      <td className="py-3 px-1 whitespace-nowrap">
        <Token
          baseTokenName={item?.baseTokenName}
          quoteTokenName={item?.quoteTokenName}
          isSpot={item?.isSpot}
          maxLeverage={item?.maxLeverage}
        />
      </td>
      <td className="py-3 px-1 text-[10px] tracking-[-0.2%] leading-[1.0] whitespace-nowrap font-medium text-[#FAFAFA]">
        {currentPrice}
      </td>
      <td
        className={cn(
          "py-3 px-1 text-[10px] tracking-[-0.2%] leading-[1.0] whitespace-nowrap font-medium text-[#00C087]",
          !isPositive && "text-[#E77977]",
        )}
      >
        {priceSymbol}
        {priceChange}/{priceSymbol}
        {priceChangePercent}
      </td>
      <td className="py-3 px-1 text-[10px] tracking-[-0.2%] leading-[1.0] whitespace-nowrap font-medium text-[#FAFAFA]">
        {volume}
      </td>

      <td className="py-3 px-1 text-[10px] tracking-[-0.2%] leading-[1.0] whitespace-nowrap font-medium text-[#FAFAFA]">
        {_openInterest ? openInterest : "--"}
      </td>
    </tr>
  );
});
