import React, { useState } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { Copy } from "@/components/icons/icons";
import { useHyperliquidUserFills } from "@/services/queries/hyperliquid-dex";

interface FillsTabProps {
  userAddress: string;
  coinInfoMap: Record<string, { name: string; icon: string }>;
}

const FillsTab = ({ userAddress, coinInfoMap }: FillsTabProps) => {
  const { data: fills } = useHyperliquidUserFills(userAddress, !!userAddress);
  const [copiedOrderId, setCopiedOrderId] = useState<number | null>(null);

  const formatNumber = (num: number | string) => {
    const n = typeof num === "string" ? parseFloat(num) : num;
    if (n === 0) return "0";
    if (n < 0.00000001) return n.toExponential(2);
    return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 8 });
  };

  const formatPrice = (price: string | number) => {
    const p = typeof price === "string" ? parseFloat(price) : price;
    return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${month}/${day}/${year} - ${hours}:${minutes}:${seconds}`;
  };

  const getCoinInfo = (symbol: string) => {
    return (
      coinInfoMap[symbol] || {
        name: symbol,
        icon: "https://static.coinstats.app/coins/1650455771843.png",
      }
    );
  };

  const getOrderType = (fill: any) => {
    if (fill.crossed) {
      return "Market";
    }
    return "Limit";
  };

  const isPerpetualFill = (fill: any) => {
    const hasPnl = fill.closedPnl && fill.closedPnl !== "0";
    return hasPnl || fill.coin.includes("-PERP") || fill.coin.includes("PERP");
  };

  const getSideLabel = (fill: any) => {
    const isBuy = fill.side === "B";
    const isPerp = isPerpetualFill(fill);

    if (isPerp) {
      return isBuy ? "Long" : "Short";
    } else {
      return isBuy ? "Buy" : "Sell";
    }
  };

  const copyToClipboard = (orderId: number) => {
    navigator.clipboard.writeText(orderId.toString());
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  if (!fills || fills.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className="grid grid-cols-[1.3fr_1fr_0.7fr_1fr_1fr_0.9fr_0.9fr_1fr] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
          style={{
            height: "40px",
            paddingTop: "12px",
            paddingBottom: "12px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          <div className="text-[#84858C] text-[12px] font-medium">Time</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Market Pair</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Side</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Size</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Price</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">PNL Impact</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Order Type</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Order ID</div>
        </div>

        {/* Empty State */}
        <div
          className="flex flex-col flex-1 items-center justify-center rounded-[15px] my-1"
          style={{
            backgroundColor: "#191B20",
            border: "1px solid #222327",
          }}
        >
          <Image src={dashboard.noOpenOrders} alt="No data" width={168} height={168} className="mb-4" />
          <p className="text-white text-[20px] font-semibold">No Fills</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="grid grid-cols-[1.3fr_1fr_0.7fr_1fr_1fr_0.9fr_0.9fr_1fr] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
        style={{
          height: "40px",
          paddingTop: "12px",
          paddingBottom: "12px",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        <div className="text-[#84858C] text-[12px] font-medium">Time</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Market Pair</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Side</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Size</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Price</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">PNL Impact</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Order Type</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Order ID</div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-auto no-scrollbar"
        style={{
          backgroundColor: "#191B20",
          borderRadius: "15px",
          border: "1px solid #222327",
          padding: "8px",
          marginTop: "8px",
        }}
      >
        {fills.map((fill, index) => {
          const coinInfo = getCoinInfo(fill.coin);
          const isBuy = fill.side === "B";
          const sideLabel = getSideLabel(fill);
          const pnl = parseFloat(fill.closedPnl);

          return (
            <div
              key={`${fill.tid}-${index}`}
              className="grid grid-cols-[1.3fr_1fr_0.7fr_1fr_1fr_0.9fr_0.9fr_1fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
              style={{
                height: "48px",
                paddingLeft: "12px",
                paddingRight: "12px",
              }}
            >
              {/* Time */}
              <span className="text-white text-[12px]">{formatTime(fill.time)}</span>

              {/* Market Pair */}
              <div className="flex items-center gap-2">
                <Image
                  src={coinInfo.icon}
                  alt={coinInfo.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = "https://static.coinstats.app/coins/1650455771843.png";
                  }}
                />
                <span className="text-white text-[13px] font-medium">{coinInfo.name}</span>
              </div>

              {/* Side */}
              <span className={`text-[12px] font-medium ${isBuy ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
                {sideLabel}
              </span>

              {/* Size */}
              <span className="text-white text-[12px]">
                {formatNumber(fill.sz)} {fill.coin}
              </span>

              {/* Price */}
              <span className="text-white text-[12px]">{formatPrice(fill.px)}</span>

              {/* PNL Impact */}
              <span className={`text-[12px] font-medium ${pnl >= 0 ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
                {pnl === 0 ? "-" : `${pnl >= 0 ? "+" : ""}${formatPrice(pnl)}`}
              </span>

              {/* Order Type */}
              <span className="text-white text-[12px]">{getOrderType(fill)}</span>

              {/* Order ID */}
              <div className="flex items-center gap-2">
                <span className="text-white text-[12px] font-mono">{fill.oid}</span>
                <button
                  onClick={() => copyToClipboard(fill.oid)}
                  className="hover:opacity-70 transition-opacity"
                  title="Copy order ID"
                >
                  <div className="w-3 h-3 text-[#84858C]">
                    <Copy />
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FillsTab;
