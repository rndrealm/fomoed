"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import {
  useHyperliquidOpenOrders,
  useHyperliquidHistoricalOrders,
  useHyperliquidUserFills,
  useHyperliquidTwapSliceFills,
} from "@/services/queries/hyperliquid-dex";
import { useFetchCoinStatsToken } from "@/services/queries/charts";

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

  const { data: openOrders } = useHyperliquidOpenOrders(userAddress, !!userAddress);
  const { data: historicalOrders } = useHyperliquidHistoricalOrders(userAddress, !!userAddress);
  const { data: fills } = useHyperliquidUserFills(userAddress, !!userAddress);
  const { data: twapFills } = useHyperliquidTwapSliceFills(userAddress, !!userAddress);
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

  const conditionalOrders = useMemo(() => {
    if (!openOrders) return [];
    return openOrders.filter((order) => order.isTrigger || order.isPositionTpsl);
  }, [openOrders]);

  const runningTwaps = useMemo(() => {
    if (!openOrders) return [];
    return openOrders.filter((order) => order.orderType.includes("TWAP"));
  }, [openOrders]);

  const formatNumber = (num: number | string) => {
    const n = typeof num === "string" ? parseFloat(num) : num;
    if (n === 0) return "0";
    if (n < 0.00000001) return n.toExponential(2);
    return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 8 });
  };

  const formatPrice = (price: string | number) => {
    const p = typeof price === "string" ? parseFloat(price) : price;
    return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCoinInfo = (symbol: string) => {
    return (
      coinInfoMap[symbol] || {
        name: symbol,
        icon: "https://static.coinstats.app/coins/default.png",
      }
    );
  };

  const getEmptyStateText = () => {
    switch (activeTab) {
      case "open-orders":
        return "No Open Orders";
      case "conditional-orders":
        return "No Conditional Orders";
      case "running-twaps":
        return "No Running TWAPs";
      case "fills":
        return "No Fills";
      case "order-history":
        return "No Order History";
      case "twap-history":
        return "No TWAP History";
      default:
        return "No Data";
    }
  };

  const renderOpenOrders = () => {
    let orders;
    if (activeTab === "open-orders") {
      orders = openOrders;
    } else if (activeTab === "conditional-orders") {
      orders = conditionalOrders;
    } else if (activeTab === "running-twaps") {
      orders = runningTwaps;
    } else {
      return null;
    }
    
    if (!orders || orders.length === 0) return null;

    return orders.map((order) => {
      const coinInfo = getCoinInfo(order.coin);
      const isBuy = order.side === "B";

      return (
        <div
          key={order.oid}
          className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
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
              src={coinInfo.icon}
              alt={coinInfo.name}
              width={32}
              height={32}
              className="rounded-full"
              onError={(e) => {
                e.currentTarget.src = "https://static.coinstats.app/coins/default.png";
              }}
            />
            <div className="flex flex-col justify-center">
              <span className="text-white text-[12px] font-medium leading-tight">{coinInfo.name}</span>
              <span className="text-[#84858C] text-[12px] leading-tight">{order.coin}</span>
            </div>
          </div>

          {/* Side */}
          <div className="flex items-center h-[32px]">
            <span className={`text-[12px] font-medium ${isBuy ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
              {isBuy ? "Buy" : "Sell"}
            </span>
          </div>

          {/* Type */}
          <div className="flex items-center h-[32px]">
            <span className="text-white text-[12px]">{order.orderType}</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-white text-[12px] font-medium">{formatPrice(order.limitPx)}</span>
          </div>

          {/* Size */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-white text-[12px]">{formatNumber(order.sz)}</span>
          </div>

          {/* Filled */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-white text-[12px]">
              {formatNumber(parseFloat(order.origSz) - parseFloat(order.sz))} / {formatNumber(order.origSz)}
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-[#84858C] text-[12px]">{formatTime(order.timestamp)}</span>
          </div>
        </div>
      );
    });
  };

  const renderFills = () => {
    if (!fills || fills.length === 0) return null;

    return fills.map((fill, index) => {
      const coinInfo = getCoinInfo(fill.coin);
      const isBuy = fill.side === "B";
      const pnl = parseFloat(fill.closedPnl);

      return (
        <div
          key={`${fill.tid}-${index}`}
          className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
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
              src={coinInfo.icon}
              alt={coinInfo.name}
              width={32}
              height={32}
              className="rounded-full"
              onError={(e) => {
                e.currentTarget.src = "https://static.coinstats.app/coins/default.png";
              }}
            />
            <div className="flex flex-col justify-center">
              <span className="text-white text-[12px] font-medium leading-tight">{coinInfo.name}</span>
              <span className="text-[#84858C] text-[12px] leading-tight">{fill.coin}</span>
            </div>
          </div>

          {/* Side */}
          <div className="flex items-center h-[32px]">
            <span className={`text-[12px] font-medium ${isBuy ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
              {isBuy ? "Buy" : "Sell"}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-white text-[12px] font-medium">{formatPrice(fill.px)}</span>
          </div>

          {/* Size */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-white text-[12px]">{formatNumber(fill.sz)}</span>
          </div>

          {/* Fee */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-white text-[12px]">{formatPrice(fill.fee)}</span>
          </div>

          {/* PnL */}
          <div className="flex items-center justify-end h-[32px]">
            <span className={`text-[12px] font-medium ${pnl >= 0 ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
              {pnl >= 0 ? "+" : ""}
              {formatPrice(pnl)}
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-[#84858C] text-[12px]">{formatTime(fill.time)}</span>
          </div>
        </div>
      );
    });
  };

  const renderOrderHistory = () => {
    if (!historicalOrders || historicalOrders.length === 0) return null;

    return historicalOrders.map((item) => {
      const order = item.order;
      const coinInfo = getCoinInfo(order.coin);
      const isBuy = order.side === "B";

      return (
        <div
          key={order.oid}
          className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
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
              src={coinInfo.icon}
              alt={coinInfo.name}
              width={32}
              height={32}
              className="rounded-full"
              onError={(e) => {
                e.currentTarget.src = "https://static.coinstats.app/coins/default.png";
              }}
            />
            <div className="flex flex-col justify-center">
              <span className="text-white text-[12px] font-medium leading-tight">{coinInfo.name}</span>
              <span className="text-[#84858C] text-[12px] leading-tight">{order.coin}</span>
            </div>
          </div>

          {/* Side */}
          <div className="flex items-center h-[32px]">
            <span className={`text-[12px] font-medium ${isBuy ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
              {isBuy ? "Buy" : "Sell"}
            </span>
          </div>

          {/* Type */}
          <div className="flex items-center h-[32px]">
            <span className="text-white text-[12px]">{order.orderType}</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-white text-[12px] font-medium">{formatPrice(order.limitPx)}</span>
          </div>

          {/* Size */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-white text-[12px]">{formatNumber(order.origSz)}</span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-end h-[32px]">
            <span
              className={`text-[12px] px-2 py-1 rounded ${
                item.status === "filled"
                  ? "bg-[#00AF58]/20 text-[#00AF58]"
                  : item.status === "canceled"
                  ? "bg-[#DC2626]/20 text-[#DC2626]"
                  : "bg-[#84858C]/20 text-[#84858C]"
              }`}
            >
              {item.status}
            </span>
          </div>

          {/* Order Time */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-[#84858C] text-[12px]">{formatTime(order.timestamp)}</span>
          </div>

          {/* Status Time */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-[#84858C] text-[12px]">{formatTime(item.statusTimestamp)}</span>
          </div>
        </div>
      );
    });
  };

  const renderTwapHistory = () => {
    if (!twapFills || twapFills.length === 0) return null;

    return twapFills.map((twapFill, index) => {
      const fill = twapFill.fill;
      const coinInfo = getCoinInfo(fill.coin);
      const isBuy = fill.side === "B";

      return (
        <div
          key={`${fill.tid}-${index}`}
          className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
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
              src={coinInfo.icon}
              alt={coinInfo.name}
              width={32}
              height={32}
              className="rounded-full"
              onError={(e) => {
                e.currentTarget.src = "https://static.coinstats.app/coins/default.png";
              }}
            />
            <div className="flex flex-col justify-center">
              <span className="text-white text-[12px] font-medium leading-tight">{coinInfo.name}</span>
              <span className="text-[#84858C] text-[12px] leading-tight">{fill.coin}</span>
            </div>
          </div>

          {/* TWAP ID */}
          <div className="flex items-center h-[32px]">
            <span className="text-white text-[12px]">#{twapFill.twapId}</span>
          </div>

          {/* Side */}
          <div className="flex items-center h-[32px]">
            <span className={`text-[12px] font-medium ${isBuy ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
              {isBuy ? "Buy" : "Sell"}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-white text-[12px] font-medium">{formatPrice(fill.px)}</span>
          </div>

          {/* Size */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-white text-[12px]">{formatNumber(fill.sz)}</span>
          </div>

          {/* Fee */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-white text-[12px]">{formatPrice(fill.fee)}</span>
          </div>

          {/* Time */}
          <div className="flex items-center justify-end h-[32px]">
            <span className="text-[#84858C] text-[12px]">{formatTime(fill.time)}</span>
          </div>
        </div>
      );
    });
  };

  const renderContent = () => {
    let data: any[] = [];
    let headers: string[] = [];

    switch (activeTab) {
      case "open-orders":
        data = openOrders || [];
        headers = ["Coin", "Side", "Type", "Price", "Size", "Filled", "Time"];
        return { data, headers, render: renderOpenOrders };
      case "conditional-orders":
        data = conditionalOrders;
        headers = ["Coin", "Side", "Type", "Trigger Price", "Size", "Filled", "Time"];
        return { data, headers, render: renderOpenOrders };
      case "running-twaps":
        data = runningTwaps;
        headers = ["Coin", "Side", "Type", "Price", "Size", "Filled", "Time"];
        return { data, headers, render: renderOpenOrders };
      case "fills":
        data = fills || [];
        headers = ["Coin", "Side", "Price", "Size", "Fee", "PnL", "Time"];
        return { data, headers, render: renderFills };
      case "order-history":
        data = historicalOrders || [];
        headers = ["Coin", "Side", "Type", "Price", "Size", "Status", "Order Time", "Status Time"];
        return { data, headers, render: renderOrderHistory };
      case "twap-history":
        data = twapFills || [];
        headers = ["Coin", "TWAP ID", "Side", "Price", "Size", "Fee", "Time"];
        return { data, headers, render: renderTwapHistory };
      default:
        return { data: [], headers: [], render: () => null };
    }
  };

  const content = renderContent();
  const hasData = content.data.length > 0;

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

      {/* Table */}
      <div className="flex-1 flex flex-col overflow-hidden px-3">
        {/* Header */}
        <div
          className={`grid gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center`}
          style={{
            gridTemplateColumns: `repeat(${content.headers.length}, 1fr)`,
            height: "32px",
            paddingTop: "8px",
            paddingBottom: "8px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          {content.headers.map((header, index) => (
            <div
              key={header}
              className={`text-[#84858C] text-[12px] font-medium ${index === 0 ? "text-left" : "text-right"}`}
            >
              {header}
            </div>
          ))}
        </div>

        {/* Content */}
        {hasData ? (
          <div className="flex-1 overflow-auto no-scrollbar">{content.render()}</div>
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

export default TradesTab;