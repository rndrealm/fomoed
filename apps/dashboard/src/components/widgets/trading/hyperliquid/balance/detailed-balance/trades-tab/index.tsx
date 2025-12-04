"use client";
import React, { useState, useMemo } from "react";
import { useFetchCoinStatsToken } from "@/services/queries/charts";
import OpenOrdersTab from "./orders-tab";
import ConditionalOrdersTab from "./conditional-orders-tab";
import RunningTwapsTab from "./running-twap-tabs"
import FillsTab from "./fills-tab";
import OrderHistoryTab from "./order-history-tab";
import TwapHistoryTab from "./twap-history-tab";

interface TradesTabProps {
  userAddress: string;
}

const TradesTab = ({ userAddress }: TradesTabProps) => {
  const [activeTab, setActiveTab] = useState<
    "open-orders" | "conditional-orders" | "running-twaps" | "fills" | "order-history" | "twap-history"
  >("open-orders");

  const tabs = [
    { key: "open-orders", label: "Open Orders" },
    { key: "conditional-orders", label: "Conditional Orders" },
    { key: "running-twaps", label: "Running TWAPs" },
    { key: "fills", label: "Fills" },
    { key: "order-history", label: "Order History" },
    { key: "twap-history", label: "TWAP History" },
  ];

  const { data: coinStatsData } = useFetchCoinStatsToken();

  const coinInfoMap = useMemo(() => {
    if (!coinStatsData) return {};
    const map: Record<string, { name: string; icon: string }> = {};
    coinStatsData.forEach((coin) => {
      map[coin.symbol.toUpperCase()] = {
        name: coin.name,
        icon: coin.icon,
      };
    });
    return map;
  }, [coinStatsData]); 

  const renderActiveTab = () => {
    switch (activeTab) {
      case "open-orders":
        return <OpenOrdersTab userAddress={userAddress} coinInfoMap={coinInfoMap} />;
      case "conditional-orders":
        return <ConditionalOrdersTab userAddress={userAddress} coinInfoMap={coinInfoMap} />;
      case "running-twaps":
        return <RunningTwapsTab userAddress={userAddress} coinInfoMap={coinInfoMap} />;
      case "fills":
        return <FillsTab userAddress={userAddress} coinInfoMap={coinInfoMap} />;
      case "order-history":
        return <OrderHistoryTab userAddress={userAddress} coinInfoMap={coinInfoMap} />;
      case "twap-history":
        return <TwapHistoryTab userAddress={userAddress} coinInfoMap={coinInfoMap} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-white text-[22px] px-3 py-2">Trades</p>

      {/* Sub-tabs */}
      <div className="flex items-center px-3 pb-3 overflow-x-auto no-scrollbar">
        <div className="flex bg-[#222329] p-[2px] rounded-[6px]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`text-[12px] px-3 h-[24px] transition whitespace-nowrap rounded-[4px] ${
                activeTab === tab.key ? "bg-[#2B2C32] text-white" : "text-[#84858C]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="flex-1 overflow-hidden px-3">{renderActiveTab()}</div>
    </div>
  );
};

export default TradesTab;