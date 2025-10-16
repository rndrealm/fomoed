"use client";
import React from "react";
import ExchangeButton from "./exchange-button";
import dashboard from "@/lib/assets/dashboard";

type ExchangeType = "ascendex" | "backpack" | "hyperliquid" | "coinw" | "bybit" | "binance";

interface ExchangePickerProps {
  onExchangeSelect: (exchange: ExchangeType) => void;
}

const exchanges = [
  { id: "ascendex" as const, logoSrc: dashboard.ascendexLogo, alt: "AscendEX", width: 96, height: 14 },
  { id: "backpack" as const, logoSrc: dashboard.backpackLogo, alt: "Backpack", width: 78, height: 16 },
  { id: "hyperliquid" as const, logoSrc: dashboard.hyperliquidLogo2, alt: "Hyperliquid", width: 102, height: 19 },
  { id: "coinw" as const, logoSrc: dashboard.coinwLogo, alt: "CoinW", width: 60, height: 16 },
  { id: "bybit" as const, logoSrc: dashboard.bybitLogo, alt: "BYBIT", width: 41, height: 16 },
  { id: "binance" as const, logoSrc: dashboard.binanceLogo, alt: "Binance", width: 80, height: 16 },
];

export default function ExchangePicker({ onExchangeSelect }: ExchangePickerProps) {
  return (
    <div className="relative flex h-full w-full justify-center items-center bg-[#121317] rounded-2xl p-8">
      {/* Grab handle at top center */}
      <div className="absolute h-[50px] top-[-20px] bottom-0 left-0 right-0 cursor-grab" />

      <div className="absolute top-[10px] left-1/2 -translate-x-1/2 flex justify-center cursor-grab z-20">
        <div className="h-[5px] w-[36px] rounded-[2px] bg-[#444]" />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center gap-8 w-full mt-4">
        <h2 className="text-white text-[20px] font-semibold text-center max-w-md leading-tight">
          Choose Your preferred Exchange from our Partners
        </h2>

        <div className="grid grid-cols-3 gap-x-2 gap-y-4 justify-items-center">
          {exchanges.map((exchange) => (
            <ExchangeButton
              key={exchange.id}
              logoSrc={exchange.logoSrc}
              alt={exchange.alt}
              imgWidth={exchange.width}
              imgHeight={exchange.height}
              onClick={() => onExchangeSelect(exchange.id)}
              disabled={exchange.id !== "ascendex"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
