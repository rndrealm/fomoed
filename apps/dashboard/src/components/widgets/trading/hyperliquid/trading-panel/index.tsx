"use client";
import React, { useState } from "react";
import BalancesTab from "./balances-tab";
import OpenPositionsTab from "./position-tab";
import OpenOrdersTab from "./open-orders";
import OrderHistoryTab from "./order-history";
import NewsTab from "./news-tab";
import Checkbox from "@/components/ui/checkbox";
import { useHyperliquidClearinghouseState } from "@/services/queries/hyperliquid-dex";
import { cn } from "@/lib/utils";
const userAddress = "0x02eC6F09CF972caEBd171314AE1C5c1B30919a57";

const tabContent = [
  { id: "balances", component: BalancesTab },
  { id: "open_positions", component: OpenPositionsTab },
  { id: "open_orders", component: OpenOrdersTab },
  { id: "order_history", component: OrderHistoryTab },
  { id: "news", component: NewsTab },
];

const tabs = [
  { id: "balances", label: "Balances" },
  { id: "open_positions", label: "Open Positions" },
  { id: "open_orders", label: "Open Orders" },
  { id: "order_history", label: "Order History" },
  { id: "news", label: "News" },
];

export default function TradingPanel() {
  const [activeTab, setActiveTab] = useState("balances");
  const [hideSmallBalances, setHideSmallBalances] = useState(false);

  const { data: clearinghouseState, isLoading } = useHyperliquidClearinghouseState(userAddress, !!userAddress);

  const totalBalance = clearinghouseState?.marginSummary?.accountValue
    ? parseFloat(clearinghouseState.marginSummary.accountValue)
    : 0;

  return (
    <div className="bg-[#121317] rounded-[6px] flex flex-col mb-2 h-[400px]">
      <div className="flex items-center justify-between border-b border-[#0C0C0C] h-[40px] px-3 py-2">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          {tabs.map((tab, index) => (
            <button
              key={`${tab}-${index}`}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-[6px] text-[12px] font-medium transition-colors h-[24px] px-3 py-1 ${
                activeTab === tab.id ? "bg-[#222329] text-white" : "bg-transparent text-[#84858C] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Hide Small Balances Toggle */}
        {(activeTab === "Balances" || activeTab === "Open Positions") && (
          <Checkbox
            label="Hide Small Balances"
            checked={hideSmallBalances}
            onCheckedChange={setHideSmallBalances}
            labelClassName="text-white text-[12px]"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tabContent.map((tab) => {
          return (
            <div key={tab.id} className={cn("h-full w-full", activeTab === tab.id ? "block" : "hidden")}>
              {tab.component()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
