"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Trade {
  price: number;
  qty: number;
  side: "buy" | "sell";
  time: string;
}

export default function Trades() {
  const mockTrades: Trade[] = useMemo(() => {
    const trades: Trade[] = [];
    for (let i = 0; i < 20; i++) {
      const isBuy = Math.random() > 0.5;
      const price = isBuy
        ? 120000 + Math.random() * 5000
        : 120000 - Math.random() * 5000;

      const time = new Date(Date.now() - i * 60000)
        .toTimeString()
        .split(" ")[0]
        .slice(0, 8);

      trades.push({
        price: Number(price.toFixed(2)),
        qty: Number((Math.random() * 0.00001 + 0.000004).toFixed(6)),
        side: isBuy ? "buy" : "sell",
        time,
      });
    }
    return trades;
  }, []);

  return (
    <div className="flex flex-col h-full text-xs text-white  rounded-lg overflow-hidden ">
      <div className="grid grid-cols-3 px-3 py-2 text-[#9CA3AF] text-[8px] ">
        <span className="text-center text-white">Price (USD)</span>
        <span className="text-center">Qty (BTC)</span>
        <span className="text-center"></span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {mockTrades.map((trade, idx) => (
          <div
            key={idx}
            className={cn(
              "grid grid-cols-3 px-3 py-[6px] text-[8px]",
              trade.side === "buy" ? "text-[#00AF58]" : "text-[#DC2626]"
            )}
          >
            <span className="text-center">{trade.price.toLocaleString()}</span>
            <span className="text-center text-white/80">
              {trade.qty.toFixed(6)}
            </span>
            <span className="text-center text-[#9CA3AF]">{trade.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
