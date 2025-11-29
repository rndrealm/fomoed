"use client";
import React, { useState } from "react";
import BalancesTab from "./balances-tab";
import OpenOrdersTab from "./open-orders";
import OrderHistoryTab from "./order-history";
import NewsTab from "./news-tab";
import Checkbox from "@/components/ui/checkbox";
import { useHyperliquidClearinghouseState } from "@/services/queries/hyperliquid-dex";

export default function TradingPanel() {
  const [activeTab, setActiveTab] = useState("Balances");
  const [hideSmallBalances, setHideSmallBalances] = useState(false);
  const userAddress = "0x02eC6F09CF972caEBd171314AE1C5c1B30919a57";

  const { data: clearinghouseState, isLoading } = useHyperliquidClearinghouseState(
    userAddress,
    !!userAddress
  );

  const tabs = ["Balances", "Open Orders", "Order History", "News"];

  const totalBalance = clearinghouseState?.marginSummary?.accountValue 
    ? parseFloat(clearinghouseState.marginSummary.accountValue)
    : 0;

  const renderTabContent = () => {
    switch (activeTab) {
      case "Balances":
        return <BalancesTab hideSmallBalances={hideSmallBalances} userAddress={userAddress} />;
      case "Open Orders":
        return <OpenOrdersTab userAddress={userAddress}/>;
      case "Order History":
        return <OrderHistoryTab userAddress={userAddress} />;
      case "News":
        return <NewsTab />;
      default:
        return <BalancesTab hideSmallBalances={hideSmallBalances} userAddress={userAddress} />;
    }
  };

  return (
    <div className="bg-[#121317] rounded-[6px] flex flex-col mb-2">
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
                activeTab === tab ? "bg-[#222329] text-white" : "bg-transparent text-[#84858C] hover:text-white"
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
          <div className="text-white text-[16px] font-medium">
            {isLoading ? (
              <span className="text-[#84858C]">Loading...</span>
            ) : (
              `$ ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">{renderTabContent()}</div>
    </div>
  );
}