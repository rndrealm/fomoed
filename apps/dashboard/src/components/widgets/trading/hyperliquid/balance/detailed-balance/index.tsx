"use client";
import React, { useState } from "react";
import BalancesTab from "./balances-tab";
import TransfersTab from "./transfers-tab";
import TradesTab from "./trades-tab";
import FuturesTab from "./futures-tab";
import SettingsTab from "./settings-tab";

export interface CoinOption {
  symbol: string;
  name: string;
  icon: string;
  type: string;
}

interface BalanceTabProps {
  userAddress: string;
}

export default function DetailedBalance({userAddress} : BalanceTabProps) {
  const [activeTab, setActiveTab] = useState("Balances");

  const tabs = ["Balances", "Transfers", "Trades", "Futures"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Balances":
        return <BalancesTab userAddress={userAddress} />;
      case "Transfers":
        return <TransfersTab userAddress={userAddress} />;
      case "Trades":
        return <TradesTab userAddress={userAddress} />;
      case "Futures":
        return <FuturesTab userAddress={userAddress} />;
      // case "Settings":
      //   return <SettingsTab  />;
      default:
        return <BalancesTab userAddress={userAddress}   />;
    }
  };

  return (
    <div 
      className="bg-[#121317] rounded-[10px] flex flex-col" 
      style={{ height: "578px" }}
    >
      {/* Tabs */}
      <div 
        className="flex items-center border-b border-[#0C0C0C]"
        style={{ 
          height: "40px",
          paddingTop: "8px",
          paddingRight: "12px",
          paddingBottom: "8px",
          paddingLeft: "12px",
          gap: "10px"
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-[6px] text-[12px] font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#222329] text-white"
                : "bg-transparent text-[#84858C] hover:text-white"
            }`}
            style={{
              height: "24px",
              paddingTop: "4px",
              paddingRight: "12px",
              paddingBottom: "4px",
              paddingLeft: "12px"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">{renderTabContent()}</div>
    </div>
  );
}