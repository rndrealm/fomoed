"use client";
import React, { useState, useMemo } from "react";
import Image, { StaticImageData } from "next/image";
import { cn } from "@/lib/utils";
import dashboard from "@/lib/assets/dashboard";
import { OrderBookLevel, useOrderBook } from "../chart/trading-view/hyperliquid/use-order-book";
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { useAtomValue } from "jotai";
import { RenderIf } from "@/components/shared";

interface OrderItemProps {
  item: OrderBookLevel;
  type: "ask" | "bid";
  width?: number;
  totalInUsdc?: number;
  total?: number;
  sizeInUsdc?: number;
}

const iconMap: Record<"buy" | "sell" | "both", StaticImageData> = {
  buy: dashboard.buyOrderbook,
  sell: dashboard.sellOrderbook,
  both: dashboard.allOrderbook,
};

const colorMap = {
  bid: { base: "#00AF58", light: "#33BF79" },
  ask: { base: "#461B1B", light: "#6E2828" },
};

const formatNumber = (num: number) => {
  return Math.floor(num).toLocaleString();
};

function OrderItem(props: OrderItemProps) {
  const { item, type, width = 0, total = 0, sizeInUsdc = 0, totalInUsdc = 0 } = props;

  const backgroundColor = colorMap[type].base;
  const widthBorderColor = colorMap[type].light;

  return (
    <div
      className="relative overflow-hidden mb-[2px] rounded-[2px]"
      style={{ backgroundColor: "transparent", height: "16px" }}
    >
      <div
        className="absolute top-0 left-0 h-full"
        style={{
          width: `${width}%`,
          backgroundColor: widthBorderColor,
        }}
      />
      <div className="relative grid grid-cols-3 items-center px-3 text-[8px] text-white h-full">
        <p className="text-center">{item.px}</p>
        <p className="text-center">{formatNumber(sizeInUsdc)}</p>
        <p className="text-center">{formatNumber(totalInUsdc)}</p>
      </div>
    </div>
  );
}

export default function OrderBooks() {
  const selectedToken = useAtomValue(selectedTokenAtom);

  const [mode, setMode] = useState<"buy" | "sell" | "both">("both");
  const [depth, setDepth] = useState(0.1);

  const { asks, bids, isConnected, maxAskVolume, maxBidVolume } = useOrderBook(selectedToken?.name);

  const handleDepthChange = (delta: number) => {
    setDepth((prev) => Math.max(0.01, +(prev + delta).toFixed(2)));
  };

  const processedAsks = useMemo(() => {
    const reversed = asks.reverse().slice(0, asks.length);

    let cumulative = 0;
    const cumulativeData = Array(asks.length).fill(0);
    const processedData = [];

    for (let i = reversed.length - 1; i >= 0; i--) {
      const item = reversed[i];
      const sizeInUsdc = parseFloat(item.sz || "0") * parseFloat(item.px || "0");
      cumulative += sizeInUsdc;
      cumulativeData[i] = cumulative;
      processedData.unshift({
        ...item,
        sizeInUsdc,
        cumulativeTotal: cumulative,
      });
    }

    return processedData;
  }, [asks]);

  const processedBids = useMemo(() => {
    let cumulative = 0;
    return bids.slice(0, 11).map((item) => {
      const sizeInUsdc = parseFloat(item.sz || "0") * parseFloat(item.px || "0");
      cumulative += sizeInUsdc;
      return {
        ...item,
        sizeInUsdc,
        cumulativeTotal: cumulative,
      };
    });
  }, [bids]);

  return (
    <div className="flex flex-col h-full w-full text-[11px] text-[#9CA3AF]">
      {/* Header Controls */}
      <div className="flex items-center justify-between px-3 py-2 ">
        <div className="flex items-center gap-1 invisible">
          {(["buy", "sell", "both"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMode(type)}
              className={cn(
                "flex items-center justify-center rounded-[4px] w-[18px] h-[18px] hover:bg-[#2B2C32] transition-colors",
                mode === type && "bg-[#2B2C32]",
              )}
            >
              <Image src={iconMap[type]} alt={`${type} icon`} width={10} height={8} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-white text-[10px]">
          <button
            onClick={() => handleDepthChange(-0.1)}
            className="px-[6px] py-[2px] rounded-[4px] bg-[#1C1D22] hover:bg-[#2B2C32]"
          >
            -
          </button>
          <span className="min-w-[24px] text-center text-[#9CA3AF]">{depth.toFixed(1)}</span>
          <button
            onClick={() => handleDepthChange(0.1)}
            className="px-[6px] py-[2px] rounded-[4px] bg-[#1C1D22] hover:bg-[#2B2C32]"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 px-1 py-1 text-center text-[#9CA3AF] text-[10px] ">
        <p>Price </p>
        <p className="text-center">Size (USDC)</p>
        <p className="text-center">Total (USDC)</p>
      </div>

      <RenderIf condition={mode === "both" && isConnected}>
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-aut border-b border-[#1C1D22] no-scrollbar">
            {processedAsks?.slice(processedAsks.length - 11, processedAsks.length)?.map((item, index) => {
              const width = (parseFloat(item.sz || "0") / maxAskVolume) * 100;

              return (
                <OrderItem
                  key={index}
                  item={item}
                  type="ask"
                  width={width}
                  totalInUsdc={item?.cumulativeTotal}
                  sizeInUsdc={item?.sizeInUsdc}
                />
              );
            })}
          </div>

          <div
            className="sticky top-0 bg-[#101113] flex items-center border-y border-[#1C1D22] px-2"
            style={{ height: "18px" }}
          ></div>

          <div className="flex-1 overflow-y-aut no-scrollbar">
            {processedBids.slice(0, 11).map((item, index) => {
              const width = (parseFloat(item.sz || "0") / maxBidVolume) * 100;

              return (
                <OrderItem
                  key={index}
                  item={item}
                  type="bid"
                  width={width}
                  sizeInUsdc={item?.sizeInUsdc}
                  totalInUsdc={item?.cumulativeTotal}
                />
              );
            })}
          </div>
        </div>
      </RenderIf>
    </div>
  );
}
