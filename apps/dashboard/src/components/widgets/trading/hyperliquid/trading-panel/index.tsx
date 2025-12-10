"use client";
import React, { useState } from "react";
import BalancesTab from "./balances-tab";
import OpenPositionsTab from "./position-tab";
import OpenOrdersTab from "./open-orders";
import TradeHistoryTab from "./trade-history";
import OrderHistoryTab from "./order-history";
import NewsTab from "./news-tab";
import Checkbox from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import { useClearingHouseState } from "../../chart/trading-view/hyperliquid/use-clearinghouse-state";
import { useOpenOrders } from "../../chart/trading-view/hyperliquid/use-open-orders";
import { RenderIf } from "@/components/shared";

const tabContent = [
  { id: "balances", component: <BalancesTab /> },
  { id: "open_positions", component: <OpenPositionsTab /> },
  { id: "open_orders", component: <OpenOrdersTab /> },
  { id: "trade_history", component: <TradeHistoryTab /> },
  { id: "order_history", component: <OrderHistoryTab /> },
  { id: "news", component: <NewsTab /> },
];

const tabs = [
  { id: "balances", label: "Balances", showCount: false },
  { id: "open_positions", label: "Open Positions", showCount: true },
  { id: "open_orders", label: "Open Orders", showCount: true },
  { id: "trade_history", label: "Trade History", showCount: false },
  { id: "order_history", label: "Order History", showCount: false },
  { id: "news", label: "News", showCount: false },
];

interface ITab {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function Tabs(props: ITab) {
  const { activeTab, setActiveTab } = props;
  const { address } = useAccount();
  const userAddress = address || "";

  const { clearingHouse } = useClearingHouseState(userAddress);
  const { openOrders } = useOpenOrders(address);

  const tabsCountMap: Record<string, number> = {
    open_positions: clearingHouse?.clearinghouseState?.assetPositions?.length || 0,
    open_orders: openOrders?.orders?.length || 0,
  };

  return (
    <div className="flex items-center gap-2">
      {tabs.map((tab, index) => (
        <button key={`${tab}-${index}`} onClick={() => setActiveTab(tab.id)}>
          <div
            className={cn(
              "flex items-center h-[24px] gap-1 px-3 py-1 rounded-[6px]",
              activeTab === tab.id ? "bg-[#222329]" : "bg-transparent",
            )}
          >
            <p
              className={cn(
                "text-[12px] font-medium transition-colors",
                activeTab === tab.id ? "text-white" : "text-[#84858C]",
              )}
            >
              {tab.label}
            </p>
            <RenderIf condition={tab.showCount}>
              <div className="h-[14px] w-[18px] bg-[#3F4046] border border-[#53545A] flex items-center justify-center rounded-sm">
                <p className="text-[#84858C] text-[10px] leading-[1.35]">{tabsCountMap[tab.id]}</p>
              </div>
            </RenderIf>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function TradingPanel() {
  const [activeTab, setActiveTab] = useState("open_positions");
  const [hideSmallBalances, setHideSmallBalances] = useState(true);

  return (
    <div className="bg-[#121317] rounded-[6px] flex flex-col mb-2 h-[400px]">
      <div className="flex items-center justify-between border-b border-[#0C0C0C] h-[40px] px-3 py-2">
        {/* Tabs */}

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {(activeTab === "Balances" || activeTab === "Open Positions") && (
          <Checkbox
            label="Hide Small Balances"
            checked={hideSmallBalances}
            onCheckedChange={setHideSmallBalances}
            labelClassName="text-white text-[12px]"
          />
        )}
      </div>

      <div className="flex-1 overflow-auto no-scrollbar">
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
