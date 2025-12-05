"use client";
import React, { useState } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import OpenPositionsTab from "./open-positions-tab";
import PositionHistoryTab from "./position-history-tab";
import FundingTab from "./funding-tab";
import LiquidationTab from "./liquidation-tab";

interface FuturesTabProps {
  userAddress: string;
}

const FuturesTab = ({ userAddress }: FuturesTabProps) => {
  const [activeTab, setActiveTab] = useState<
    "open-positions" | "position-history" | "funding" | "liquidation"
  >("open-positions");

  const tabs = [
    { key: "open-positions", label: "Open Positions" },
    { key: "position-history", label: "Position History" },
    { key: "funding", label: "Funding" },
    { key: "liquidation", label: "Liquidation" },
  ];

  const getEmptyStateText = () => {
    switch (activeTab) {
      case "open-positions":
        return "No Open Positions";
      case "position-history":
        return "No Position History";
      case "funding":
        return "No Funding History";
      case "liquidation":
        return "No Liquidations";
      default:
        return "No Data";
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-white text-[22px] px-3 py-2">Futures</p>

      <div className="flex items-center px-3 pb-3">
        <div className="flex bg-[#222329] p-[2px] rounded-[6px]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`text-[12px] px-3 h-[24px] transition whitespace-nowrap rounded-[4px] ${
                activeTab === tab.key
                  ? "bg-[#2B2C32] text-white"
                  : "text-[#84858C]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden px-3">
        {activeTab === "open-positions" && (
          <OpenPositionsTab
            userAddress={userAddress}
            emptyStateComponent={
              <div className="flex flex-col h-full items-center justify-center bg-[#191B20] rounded-[20px] my-1">
                <Image
                  src={dashboard.noOpenOrders}
                  alt="No data"
                  width={168}
                  height={168}
                  className="mb-4"
                />
                <p className="text-white text-[20px] font-semibold">
                  {getEmptyStateText()}
                </p>
              </div>
            }
          />
        )}

        {activeTab === "position-history" && (
          <PositionHistoryTab
            userAddress={userAddress}
            emptyStateComponent={
              <div className="flex flex-col h-full items-center justify-center bg-[#191B20] rounded-[20px] my-1">
                <Image
                  src={dashboard.noOpenOrders}
                  alt="No data"
                  width={168}
                  height={168}
                  className="mb-4"
                />
                <p className="text-white text-[20px] font-semibold">
                  {getEmptyStateText()}
                </p>
              </div>
            }
          />
        )}

        {activeTab === "funding" && (
          <FundingTab
            userAddress={userAddress}
            emptyStateComponent={
              <div className="flex flex-col h-full items-center justify-center bg-[#191B20] rounded-[20px] my-1">
                <Image
                  src={dashboard.noOpenOrders}
                  alt="No data"
                  width={168}
                  height={168}
                  className="mb-4"
                />
                <p className="text-white text-[20px] font-semibold">
                  {getEmptyStateText()}
                </p>
              </div>
            }
          />
        )}

        {activeTab === "liquidation" && (
          <LiquidationTab
            userAddress={userAddress}
            emptyStateComponent={
              <div className="flex flex-col h-full items-center justify-center bg-[#191B20] rounded-[20px] my-1">
                <Image
                  src={dashboard.noOpenOrders}
                  alt="No data"
                  width={168}
                  height={168}
                  className="mb-4"
                />
                <p className="text-white text-[20px] font-semibold">
                  {getEmptyStateText()}
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
};

export default FuturesTab;