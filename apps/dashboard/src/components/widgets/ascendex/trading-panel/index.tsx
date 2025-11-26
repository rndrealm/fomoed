"use client";
import React, { useState } from "react";
import BalancesTab from "./balances-tab";
import OpenOrdersTab from "./open-orders";
import OrderHistoryTab from "./order-history";
import NewsTab from "./news-tab";
import Checkbox from "@/components/ui/checkbox";

export default function TradingPanel() {
  const [activeTab, setActiveTab] = useState("Balances");
  const [hideSmallBalances, setHideSmallBalances] = useState(false);

  const tabs = ["Balances", "Open Orders", "Order History", "News"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Balances":
        return <BalancesTab hideSmallBalances={hideSmallBalances} />;
      case "Open Orders":
        return <OpenOrdersTab />;
      case "Order History":
        return <OrderHistoryTab />;
      case "News":
        return <NewsTab />;
      default:
        return <BalancesTab hideSmallBalances={hideSmallBalances} />;
    }
  };

  return (
    <div className="bg-[#121317] rounded-[6px] flex flex-col mb-2">
      {/* Header with Tabs and Hide Small Balances */}
      <div
        className="flex items-center justify-between border-b border-[#0C0C0C]"
        style={{
          height: "40px",
          paddingTop: "8px",
          paddingRight: "12px",
          paddingBottom: "8px",
          paddingLeft: "12px",
        }}
      >
        {/* Tabs */}
        <div className="flex items-center gap-2">
          {tabs.map((tab, index) => (
            <button
              key={`${tab}-${index}`}
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
                paddingLeft: "12px",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Hide Small Balances Toggle */}
        {activeTab === "Balances" && (
          <Checkbox
            label="Hide Small Balances"
            checked={hideSmallBalances}
            onCheckedChange={setHideSmallBalances}
            labelClassName="text-white text-[12px]"
          />
        )}
      </div>

      {/* Your Balances */}
      {activeTab === "Balances" && (
        <div className="px-3 py-2 border-b border-[#0C0C0C]">
          <div className="text-[#84858C] text-[12px]">Your Balances</div>
          <div className="text-white text-[16px] font-medium">$ 0.00</div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">{renderTabContent()}</div>
    </div>
  );
}
