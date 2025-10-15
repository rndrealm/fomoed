"use client";
import React, { useState, useMemo } from "react";
import Image, { StaticImageData } from "next/image";
import { cn } from "@/lib/utils";
import dashboard from "@/lib/assets/dashboard";

export default function OrderBooks() {
  const [mode, setMode] = useState<"buy" | "sell" | "both">("both");
  const [depth, setDepth] = useState(0.1);

  const mockBuyData = useMemo(
    () => [
      { price: "122,039.09", size: "0.000004", total: 2.1 },
      { price: "122,038.80", size: "0.000005", total: 4.8 },
      { price: "122,038.20", size: "0.000006", total: 6.3 },
      { price: "122,037.90", size: "0.000007", total: 3.9 },
      { price: "122,037.50", size: "0.000008", total: 9.1 },
      { price: "122,037.10", size: "0.000009", total: 5.7 },
      { price: "122,036.80", size: "0.000010", total: 7.4 },
      { price: "122,036.50", size: "0.000011", total: 12.6 },
      { price: "122,036.20", size: "0.000012", total: 8.5 },
      { price: "122,035.90", size: "0.000013", total: 15.0 },
      { price: "122,035.50", size: "0.000014", total: 10.2 },
      { price: "122,035.20", size: "0.000015", total: 18.4 },
      { price: "122,034.90", size: "0.000016", total: 14.1 },
      { price: "122,034.60", size: "0.000017", total: 11.7 },
      { price: "122,034.20", size: "0.000018", total: 9.8 },
      { price: "122,033.90", size: "0.000019", total: 6.6 },
      { price: "122,033.60", size: "0.000020", total: 4.2 },
      { price: "122,033.20", size: "0.000021", total: 2.9 },
      { price: "122,032.20", size: "0.000015", total: 18.4 },
      { price: "122,031.90", size: "0.000016", total: 14.1 },
      { price: "122,030.60", size: "0.000017", total: 11.7 },
      { price: "122,029.20", size: "0.000018", total: 9.8 },
      { price: "122,028.90", size: "0.000019", total: 6.6 },
      { price: "122,027.60", size: "0.000020", total: 4.2 },
      { price: "122,026.20", size: "0.000021", total: 2.9 },
    ],
    [],
  );

  const mockSellData = useMemo(
    () => [
      { price: "122,040.10", size: "0.000003", total: 3.1 },
      { price: "122,040.30", size: "0.000004", total: 4.5 },
      { price: "122,040.60", size: "0.000005", total: 6.0 },
      { price: "122,040.90", size: "0.000006", total: 8.2 },
      { price: "122,041.10", size: "0.000007", total: 10.9 },
      { price: "122,041.40", size: "0.000008", total: 7.5 },
      { price: "122,041.80", size: "0.000009", total: 12.2 },
      { price: "122,042.10", size: "0.000010", total: 15.8 },
      { price: "122,042.50", size: "0.000011", total: 9.4 },
      { price: "122,042.90", size: "0.000012", total: 13.7 },
      { price: "122,043.20", size: "0.000013", total: 17.1 },
      { price: "122,043.50", size: "0.000014", total: 11.6 },
      { price: "122,043.90", size: "0.000015", total: 14.3 },
      { price: "122,044.20", size: "0.000016", total: 8.9 },
      { price: "122,044.50", size: "0.000017", total: 5.2 },
      { price: "122,044.90", size: "0.000018", total: 3.9 },
      { price: "122,045.20", size: "0.000019", total: 2.4 },
      { price: "122,045.50", size: "0.000020", total: 1.1 },
      { price: "122,046.20", size: "0.000013", total: 17.1 },
      { price: "122,047.50", size: "0.000014", total: 11.6 },
      { price: "122,048.90", size: "0.000015", total: 14.3 },
      { price: "122,049.20", size: "0.000016", total: 8.9 },
      { price: "122,050.50", size: "0.000017", total: 5.2 },
      { price: "122,051.90", size: "0.000018", total: 3.9 },
      { price: "122,052.20", size: "0.000019", total: 2.4 },
      { price: "122,053.50", size: "0.000020", total: 1.1 },
    ],
    [],
  );

  const maxBuy = useMemo(() => Math.max(...mockBuyData.map((d) => d.total)), [mockBuyData]);
  const maxSell = useMemo(() => Math.max(...mockSellData.map((d) => d.total)), [mockSellData]);

  const handleDepthChange = (delta: number) => {
    setDepth((prev) => Math.max(0.01, +(prev + delta).toFixed(2)));
  };

  const iconMap: Record<"buy" | "sell" | "both", StaticImageData> = {
    buy: dashboard.buyOrderbook,
    sell: dashboard.sellOrderbook,
    both: dashboard.allOrderbook,
  };

  const colorMap = {
    buy: { base: "#00AF58", light: "#33BF79" },
    sell: { base: "#461B1B", light: "#6E2828" },
  };

  const renderRows = (data: any[], maxTotal: number, color: "buy" | "sell") =>
    data.map((item, idx) => {
      const widthPercent = (item.total / maxTotal) * 100;
      const { base, light } = colorMap[color];
      return (
        <div
          key={`${color}-${idx}`}
          className="relative overflow-hidden mb-[2px] rounded-[2px]"
          style={{ backgroundColor: base, height: "16px" }}
        >
          <div
            className="absolute top-0 right-0 h-full"
            style={{
              width: `${widthPercent}%`,
              backgroundColor: light,
            }}
          />
          <div className="relative grid grid-cols-3 items-center px-3 text-[8px] text-white h-full">
            <p className="text-center">{item.price}</p>
            <p className="text-center">{item.size}</p>
            <p className="text-center">{item.total.toFixed(2)}</p>
          </div>
        </div>
      );
    });

  return (
    <div className="flex flex-col h-full w-full text-[11px] text-[#9CA3AF]">
      {/* Header Controls */}
      <div className="flex items-center justify-between px-3 py-2 ">
        <div className="flex items-center gap-1">
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

      <div className="grid grid-cols-3 px-3 py-1 text-center text-[#9CA3AF] text-[10px] ">
        <p>Price (USD)</p>
        <p className="text-center">Size (BTC)</p>
        <p className="text-center">Total (BTC)</p>
      </div>

      {/* Order Book */}
      {mode === "both" ? (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto border-b border-[#1C1D22] no-scrollbar">
            {renderRows(mockSellData.slice(0, 11), maxSell, "sell")}
          </div>

          <div
            className="sticky top-0 bg-[#101113] flex items-center border-y border-[#1C1D22] px-2"
            style={{ height: "18px" }}
          >
            <span className="text-white font-medium text-[10px] mr-2">113,028.09</span>
            <span className="text-[#9CA3AF] text-[9px]">113,010.02</span>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {renderRows(mockBuyData.slice(0, 11), maxBuy, "buy")}
          </div>
        </div>
      ) : mode === "buy" ? (
        <div className="flex-1 overflow-y-auto no-scrollbar">{renderRows(mockBuyData, maxBuy, "buy")}</div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar">{renderRows(mockSellData, maxSell, "sell")}</div>
      )}
    </div>
  );
}
