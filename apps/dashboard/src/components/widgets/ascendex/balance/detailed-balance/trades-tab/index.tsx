"use client";
import React, { useState } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";

export interface CoinOption {
  symbol: string;
  name: string;
  icon: string;
  type: string;
}

interface TradesTabProps {
  coins?: CoinOption[];
}

const TradesTab = ({ coins = [] }: TradesTabProps) => {
  const [activeTab, setActiveTab] = useState<
    "open-orders" | "conditional-orders" | "running-twaps" | "fills" | "order-history" | "twap-history"
  >("open-orders");

  const hasData = coins.length > 0;

  const tabs = [
    { key: "open-orders", label: "Open Orders" },
    { key: "conditional-orders", label: "Conditional Orders" },
    { key: "running-twaps", label: "Running TWAPs" },
    { key: "fills", label: "Fills" },
    { key: "order-history", label: "Order History" },
    { key: "twap-history", label: "TWAP History" },
  ];

  const getEmptyStateText = () => {
    switch (activeTab) {
      case "open-orders":
        return "No Open Orders";
      case "conditional-orders":
        return "No Conditional Orders";
      case "running-twaps":
        return "No Running TWAPs";
      case "fills":
        return "No Fills";
      case "order-history":
        return "No Order History";
      case "twap-history":
        return "No TWAP History";
      default:
        return "No Data";
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-white text-[22px] px-3 py-2">Trades</p>
      {/* Sub-tabs */}
      <div className="flex items-center px-3 pb-3">
        <div className="flex bg-[#222329] p-[2px] rounded-[6px]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`
          text-[12px] px-3 h-[24px] transition whitespace-nowrap rounded-[4px]
          ${activeTab === tab.key ? "bg-[#2B2C32] text-white" : "text-[#84858C]"}
        `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 flex flex-col overflow-hidden px-3">
        {/* Header */}
        <div
          className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
          style={{
            height: "32px",
            paddingTop: "8px",
            paddingBottom: "8px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          <div className="text-[#84858C] text-[12px] font-medium">Coin</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Size</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Position Value</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Entry Price</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Mark Price</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">PNL (ROE%)</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Liq. Price</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Margin</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Funding</div>
        </div>

        {/* Content */}
        {hasData ? (
          <div className="flex-1 overflow-auto no-scrollbar">
            {coins.map((coin) => (
              <div
                key={coin.symbol}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
                style={{
                  height: "64px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  paddingLeft: "12px",
                  paddingRight: "12px",
                }}
              >
                {/* Coin */}
                <div className="flex items-center gap-[12px] h-[32px]">
                  <Image src={coin.icon} alt={coin.name} width={32} height={32} className="rounded-full" />
                  <div className="flex flex-col justify-center">
                    <span className="text-white text-[12px] font-medium leading-tight">{coin.name}</span>
                    <span className="text-[#84858C] text-[12px] leading-tight">{coin.symbol}</span>
                  </div>
                </div>

                {/* Size */}
                <div className="flex flex-col items-start justify-center h-[32px]">
                  <span className="text-white text-[12px] font-medium leading-tight">0.00</span>
                </div>

                {/* Position Value */}
                <div className="flex flex-col items-end justify-center h-[32px]">
                  <span className="text-white text-[12px] font-medium leading-tight">$0.00</span>
                </div>

                {/* Entry Price */}
                <div className="flex flex-col items-end justify-center h-[32px]">
                  <span className="text-white text-[12px] font-medium">$0.00</span>
                </div>

                {/* Mark Price */}
                <div className="flex flex-col items-end justify-center h-[32px]">
                  <span className="text-white text-[12px] font-medium">$0.00</span>
                </div>

                {/* PNL (ROE%) */}
                <div className="flex flex-col items-end justify-center h-[32px]">
                  <span className="text-white text-[12px] font-medium leading-tight">$0.00</span>
                  <span className="text-[#84858C] text-[12px] leading-tight">0.00%</span>
                </div>

                {/* Liq. Price */}
                <div className="flex flex-col items-end justify-center h-[32px]">
                  <span className="text-white text-[12px] font-medium">$0.00</span>
                </div>

                {/* Margin */}
                <div className="flex flex-col items-end justify-center h-[32px]">
                  <span className="text-white text-[12px] font-medium">$0.00</span>
                </div>

                {/* Funding */}
                <div className="flex flex-col items-end justify-center h-[32px]">
                  <span className="text-white text-[12px] font-medium">$0.00</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col h-full items-center justify-center bg-[#191B20] rounded-[20px] my-1">
            <Image src={dashboard.noOpenOrders} alt="No data" width={168} height={168} className="mb-4" />
            <p className="text-white text-[20px] font-semibold">{getEmptyStateText()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradesTab;
