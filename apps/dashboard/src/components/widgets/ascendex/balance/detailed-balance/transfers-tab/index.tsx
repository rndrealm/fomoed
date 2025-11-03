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

interface TransfersTabProps {
  coins?: CoinOption[];
}

const TransfersTab = ({ coins = [] }: TransfersTabProps) => {
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">("deposits");

  const hasData = coins.length > 0;

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-white text-[22px] px-3 py-2">Transfers</p>

      {/* Sub-tabs */}
      <div className="flex items-center px-3 pb-3">
        {/* Sub-tabs */}
        <div className="flex bg-[#222329] p-[2px] rounded-[6px]">
          <button
            onClick={() => setActiveTab("deposits")}
            className={`text-[12px] px-3 h-[24px] transition rounded-[4px]
        ${activeTab === "deposits" ? "bg-[#2B2C32] text-white" : "text-[#84858C]"}
      `}
          >
            Deposits
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`text-[12px] px-3 h-[24px] transition rounded-[4px]
        ${activeTab === "withdrawals" ? "bg-[#2B2C32] text-white" : "text-[#84858C]"}
      `}
          >
            Withdrawals
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
        {hasData ? (
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

                {/* Action Button */}
                <div className="flex items-center gap-2 justify-center w-[240px] h-[32px]">
                  {activeTab === "deposits" ? (
                    <button className="px-4 h-[32px] rounded-[8px] bg-[rgba(118,55,186,0.2)] text-[#7637BA] text-[12px] font-medium hover:bg-[rgba(118,55,186,0.3)] transition-colors">
                      Deposit
                    </button>
                  ) : (
                    <button className="px-4 h-[32px] rounded-[8px] bg-[#222329] text-[#E7E7E7] text-[12px] font-medium hover:bg-[#2B2C32] transition-colors">
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col h-full items-center justify-center bg-[#191B20] rounded-[20px] my-1">
            <Image src={dashboard.noDeposits} alt="No data" width={168} height={168} className="mb-4" />
            <p className="text-white text-[20px] font-semibold">
              {activeTab === "deposits" ? "No Deposits" : "No Withdrawals"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransfersTab;
