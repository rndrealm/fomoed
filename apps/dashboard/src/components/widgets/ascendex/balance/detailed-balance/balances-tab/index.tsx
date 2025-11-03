"use client";
import React, { useState } from "react";
import Image from "next/image";

export interface CoinOption {
  symbol: string;
  name: string;
  icon: string;
  type: string;
}

interface BalancesTabProps {
  coins: CoinOption[];
}

const BalancesTab = ({ coins }: BalancesTabProps) => {
  const [activeTab, setActiveTab] = useState<"assets" | "statements">("assets");

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-white text-[22px] px-3 py-2">Balances</p>

      {/* Sub-tabs */}
      <div className="flex items-center px-3 pb-3">
        <div className="flex bg-[#222329] p-[2px] rounded-[6px]">
          <button
            onClick={() => setActiveTab("assets")}
            className={`text-[12px] px-3 h-[24px] transition rounded-[5px]
        ${activeTab === "assets" ? "bg-[#2B2C32] text-white" : "text-[#84858C]"}
      `}
          >
            Assets
          </button>
          <button
            onClick={() => setActiveTab("statements")}
            className={`text-[12px] px-3 h-[24px] transition rounded-[5px]
        ${activeTab === "statements" ? "bg-[#2B2C32] text-white" : "text-[#84858C]"}
      `}
          >
            Statements
          </button>
        </div>
      </div>

      {/* Table  */}
      <div className="flex-1 flex flex-col overflow-hidden px-3">
        {/* Header */}
        <div
          className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center justify-between"
          style={{
            width: "fill (1,131px)",
            height: "32px",
            paddingTop: "8px",
            paddingBottom: "8px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          <div className="text-[#84858C] text-[12px] font-medium">Asset</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Total Balance</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Available Balance</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Open Orders</div>
          <div className="w-[240px]"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto no-scrollbar">
          {coins.map((coin) => (
            <div
              key={coin.symbol}
              className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 hover:bg-[#1C1D21] transition-colors items-center justify-between"
              style={{
                height: "64px",
                paddingTop: "16px",
                paddingBottom: "16px",
                paddingLeft: "12px",
                paddingRight: "12px",
              }}
            >
              {/* Asset */}
              <div className="flex items-center gap-[12px] h-[32px]">
                <Image src={coin.icon} alt={coin.name} width={32} height={32} className="rounded-full" />
                <div className="flex flex-col justify-center">
                  <span className="text-white text-[12px] font-medium leading-tight">{coin.name}</span>
                  <span className="text-[#84858C] text-[12px] leading-tight">{coin.symbol}</span>
                </div>
              </div>

              {/* Total Balance */}
              <div className="flex flex-col items-end justify-center h-[32px]">
                <span className="text-white text-[12px] font-medium leading-tight">0</span>
                <span className="text-[#84858C] text-[12px] leading-tight">$0.00</span>
              </div>

              {/* Available Balance */}
              <div className="flex flex-col items-end justify-center h-[32px]">
                <span className="text-white text-[12px] font-medium leading-tight">0</span>
                <span className="text-[#84858C] text-[12px] leading-tight">$0.00</span>
              </div>

              {/* Open Orders */}
              <div className="flex items-center justify-end h-[32px]">
                <span className="text-white text-[12px] font-medium">0</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 justify-end w-[240px] h-[32px]">
                <button className="px-4 h-[32px] rounded-[8px] bg-[rgba(118,55,186,0.2)] text-[#7637BA] text-[12px] font-medium hover:bg-[rgba(118,55,186,0.3)] transition-colors">
                  Deposit
                </button>
                <button className="px-4 h-[32px] rounded-[8px] bg-[#222329] text-[#E7E7E7] text-[12px] font-medium hover:bg-[#2B2C32] transition-colors">
                  Withdraw
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BalancesTab;
