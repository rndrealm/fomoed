"use client";
import React, { useState } from "react";
import BalancesTab from "./balances-tab";
import OpenPositionsTab from "./position-tab";
import OpenOrdersTab from "./open-orders";
import OrderHistoryTab from "./order-history";
import NewsTab from "./news-tab";
import Checkbox from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const tabContent = [
  { id: "balances", component: <BalancesTab /> },
  { id: "open_positions", component: <OpenPositionsTab /> },
  { id: "open_orders", component: <OpenOrdersTab /> },
  { id: "order_history", component: <OrderHistoryTab /> },
  { id: "news", component: <NewsTab /> },
];

const tabs = [
  { id: "balances", label: "Balances" },
  { id: "open_positions", label: "Open Positions" },
  { id: "open_orders", label: "Open Orders" },
  { id: "order_history", label: "Order History" },
  { id: "news", label: "News" },
];

export default function TradingPanel() {
  const [activeTab, setActiveTab] = useState("news");
  const [hideSmallBalances, setHideSmallBalances] = useState(true);

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

        {(activeTab === "Balances" || activeTab === "Open Positions") && (
          <Checkbox
            label="Hide Small Balances"
            checked={hideSmallBalances}
            onCheckedChange={setHideSmallBalances}
            labelClassName="text-white text-[12px]"
          />
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {tabContent.map((tab) => {
          return (
            <div key={tab.id} className={cn("h-full w-full", activeTab === tab.id ? "block" : "hidden")}>
              {tab.component}
            </div>
          );
        })}
      </div>
    </div>
  );
}
