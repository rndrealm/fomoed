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

const DUMMY_COINS: CoinOption[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "https://static.coinstats.app/coins/1650455588819.png",
    type: "Perp",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "https://static.coinstats.app/coins/1650455629727.png",
    type: "Perp",
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "https://static.coinstats.app/coins/1701234596791.png",
    type: "Perp",
  },
  {
    symbol: "ARB",
    name: "Arbitrum",
    icon: "https://static.coinstats.app/coins/1687522892460.png",
    type: "Perp",
  },
  {
    symbol: "XRP",
    name: "XRP",
    icon: "https://static.coinstats.app/coins/XRPdnqGJ.png",
    type: "Perp",
  },
  {
    symbol: "TRX",
    name: "Tron",
    icon: "https://static.coinstats.app/coins/TRONxJljY.png",
    type: "Perp",
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    icon: "https://static.coinstats.app/coins/DogecoinIZai5.png",
    type: "Perp",
  },
  {
    symbol: "OP",
    name: "Optimism",
    icon: "https://static.coinstats.app/coins/1664959117211.png",
    type: "Perp",
  },
];

export default function DetailedBalance() {
  const [activeTab, setActiveTab] = useState("Balances");

  const tabs = ["Balances", "Transfers", "Trades", "Futures", "Settings"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Balances":
        return <BalancesTab coins={DUMMY_COINS} />;
      case "Transfers":
        return <TransfersTab />;
      case "Trades":
        return <TradesTab  coins={DUMMY_COINS}/>;
      case "Futures":
        return <FuturesTab  />;
      case "Settings":
        return <SettingsTab  />;
      default:
        return <BalancesTab coins={DUMMY_COINS}  />;
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