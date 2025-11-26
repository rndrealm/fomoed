"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import {
  useHyperliquidClearinghouseState,
  useHyperliquidAllMids,
} from "@/services/queries/hyperliquid-dex";
import { useFetchCoinStatsToken } from "@/services/queries/charts";

interface FuturesTabProps {
  userAddress: string;
}

interface PositionData {
  coin: string;
  name: string;
  icon: string;
  size: string;
  side: "Long" | "Short";
  positionValue: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  roe: number;
  liquidationPrice: string;
  margin: number;
  leverage: string;
}

const FuturesTab = ({ userAddress }: FuturesTabProps) => {
  const [activeTab, setActiveTab] = useState<"open-positions" | "position-history" | "funding" | "liquidation">(
    "open-positions"
  );

  const tabs = [
    { key: "open-positions", label: "Open Positions" },
    { key: "position-history", label: "Position History" },
    { key: "funding", label: "Funding" },
    { key: "liquidation", label: "Liquidation" },
  ];

  const { data: clearinghouse } = useHyperliquidClearinghouseState(userAddress, !!userAddress);
  const { data: allMids } = useHyperliquidAllMids();
  const { data: coinStatsData } = useFetchCoinStatsToken();

  // Create coin info map
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

  const positions = useMemo(() => {
    if (!clearinghouse?.assetPositions || clearinghouse.assetPositions.length === 0) {
      return [];
    }

    return clearinghouse.assetPositions.map((position): PositionData => {
      const pos = position.position;
      const coinSymbol = pos.coin;
      const coinInfo = coinInfoMap[coinSymbol] || {
        name: coinSymbol,
        icon: "https://static.coinstats.app/coins/default.png",
      };

      const szi = parseFloat(pos.szi);
      const isLong = szi > 0;
      const size = Math.abs(szi);
      const entryPrice = parseFloat(pos.entryPx);
      const markPrice = allMids?.[coinSymbol] ? parseFloat(allMids[coinSymbol]) : entryPrice;
      const positionValue = size * markPrice;
      const unrealizedPnl = parseFloat(pos.unrealizedPnl);
      const marginUsed = parseFloat(pos.marginUsed);
      const roe = parseFloat(pos.returnOnEquity) * 100;
      const liquidationPrice = pos.liquidationPx || "N/A";

      const leverage =
        pos.leverage.type === "cross"
          ? "Cross"
          : `${pos.leverage.value}x`;

      return {
        coin: coinSymbol,
        name: coinInfo.name,
        icon: coinInfo.icon,
        size: `${isLong ? "+" : "-"}${size.toFixed(4)}`,
        side: isLong ? "Long" : "Short",
        positionValue,
        entryPrice,
        markPrice,
        pnl: unrealizedPnl,
        roe,
        liquidationPrice,
        margin: marginUsed,
        leverage,
      };
    });
  }, [clearinghouse, allMids, coinInfoMap]);

  const formatNumber = (num: number) => {
    if (num === 0) return "0";
    if (Math.abs(num) < 0.00000001) return num.toExponential(2);
    return num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 8 });
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getEmptyStateText = () => {
    switch (activeTab) {
      case "open-positions":
        return "No Open Positions";
      case "position-history":
        return "No Position History";
      case "funding":
        return "No Funding";
      case "liquidation":
        return "No Liquidation";
      default:
        return "No Data";
    }
  };

  const renderOpenPositions = () => {
    if (positions.length === 0) return null;

    return positions.map((position) => {
      const isLong = position.side === "Long";
      const isProfitable = position.pnl >= 0;

      return (
        <div
          key={position.coin}
          className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
          style={{
            height: "64px",
            paddingTop: "16px",
            paddingBottom: "16px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          {/* Coin */}
          <div className="flex items-center gap-[12px] h-[32px]">
            <Image
              src={position.icon}
              alt={position.name}
              width={32}
              height={32}
              className="rounded-full"
              onError={(e) => {
                e.currentTarget.src = "https://static.coinstats.app/coins/default.png";
              }}
            />
            <div className="flex flex-col justify-center">
              <span className="text-white text-[12px] font-medium leading-tight">{position.name}</span>
              <span className="text-[#84858C] text-[12px] leading-tight">{position.coin}</span>
            </div>
          </div>

          {/* Size */}
          <div className="flex flex-col items-start justify-center h-[32px]">
            <span className={`text-[12px] font-medium leading-tight ${isLong ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
              {position.size}
            </span>
            <span className="text-[#84858C] text-[10px] leading-tight">{position.side}</span>
          </div>

          {/* Position Value */}
          <div className="flex flex-col items-end justify-center h-[32px]">
            <span className="text-white text-[12px] font-medium leading-tight">
              {formatPrice(position.positionValue)}
            </span>
          </div>

          {/* Entry Price */}
          <div className="flex flex-col items-end justify-center h-[32px]">
            <span className="text-white text-[12px] font-medium">{formatPrice(position.entryPrice)}</span>
          </div>

          {/* Mark Price */}
          <div className="flex flex-col items-end justify-center h-[32px]">
            <span className="text-white text-[12px] font-medium">{formatPrice(position.markPrice)}</span>
          </div>

          {/* PNL (ROE%) */}
          <div className="flex flex-col items-end justify-center h-[32px]">
            <span className={`text-[12px] font-medium leading-tight ${isProfitable ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
              {isProfitable ? "+" : ""}
              {formatPrice(position.pnl)}
            </span>
            <span className={`text-[10px] leading-tight ${isProfitable ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
              {isProfitable ? "+" : ""}
              {position.roe.toFixed(2)}%
            </span>
          </div>

          {/* Liq. Price */}
          <div className="flex flex-col items-end justify-center h-[32px]">
            <span className="text-white text-[12px] font-medium">
              {position.liquidationPrice === "N/A" ? "N/A" : formatPrice(parseFloat(position.liquidationPrice))}
            </span>
          </div>

          {/* Margin */}
          <div className="flex flex-col items-end justify-center h-[32px]">
            <span className="text-white text-[12px] font-medium">{formatPrice(position.margin)}</span>
            <span className="text-[#84858C] text-[10px] leading-tight">{position.leverage}</span>
          </div>

          {/* Funding */}
          <div className="flex flex-col items-end justify-center h-[32px]">
            <span className="text-white text-[12px] font-medium">-</span>
          </div>
        </div>
      );
    });
  };

  const hasData = activeTab === "open-positions" ? positions.length > 0 : false;

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-white text-[22px] px-3 py-2">Futures</p>

      {/* Sub-tabs */}
      <div className="flex items-center px-3 pb-3">
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

      {/* Table */}
      <div className="flex-1 flex flex-col overflow-hidden px-3">
        {/* Header */}
        <div
          className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
          style={{
            height: "32px",
            paddingTop: "8px",
            paddingBottom: "8px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          <div className="text-[#84858C] text-[12px] font-medium">Coin</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Size</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Position Value</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Entry Price</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Mark Price</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">PNL (ROE%)</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Liq. Price</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Margin</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Funding</div>
        </div>

        {/* Content */}
        {hasData ? (
          <div className="flex-1 overflow-auto no-scrollbar">{renderOpenPositions()}</div>
        ) : (
          <div className="flex flex-col h-full items-center justify-center bg-[#191B20] rounded-[20px] my-1">
            <Image src={dashboard.noOpenOrders} alt="No data" width={168} height={168} className="mb-4" />
            <p className="text-white text-[20px] font-semibold">{getEmptyStateText()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuturesTab;