"use client";
import React from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useHyperliquidHistoricalOrders } from "@/services/queries/hyperliquid-dex";

interface OrderHistoryTabProps {
  userAddress: string;
}

export default function OrderHistoryTab({ userAddress }: OrderHistoryTabProps) {
  const { data: historicalOrders, isLoading } = useHyperliquidHistoricalOrders(
    userAddress,
    !!userAddress
  );

  const perpHistoricalOrders = historicalOrders?.filter(
    item => !item.order.coin.startsWith("@")
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[375px]">
        <div className="text-[#84858C] text-[14px]">Loading order history...</div>
      </div>
    );
  }

  if (perpHistoricalOrders.length === 0) {
    return (
      <div className="flex flex-col min-h-[375px] h-full items-center justify-center bg-[#191B20] rounded-[6px] my-1">
        <Image src={dashboard.noOpenOrders} alt="No Order History" width={168} height={168} className="mb-4" />
        <p className="text-white text-[20px] font-semibold">No Order History</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "filled":
        return "text-green-500";
      case "canceled":
      case "marginCanceled":
      case "rejected":
        return "text-red-500";
      case "open":
        return "text-blue-500";
      default:
        return "text-[#84858C]";
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      filled: "Filled",
      canceled: "Canceled",
      triggered: "Triggered",
      rejected: "Rejected",
      marginCanceled: "Margin Canceled",
      open: "Open",
      vaultWithdrawalCanceled: "Vault Withdrawal Canceled",
      openInterestCapCanceled: "OI Cap Canceled",
      selfTradeCanceled: "Self Trade Canceled",
      reduceOnlyCanceled: "Reduce Only Canceled",
      siblingFilledCanceled: "Sibling Filled",
      delistedCanceled: "Delisted",
      liquidatedCanceled: "Liquidated",
      scheduledCancel: "Scheduled Cancel",
    };
    return statusMap[status] || status;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Table Header */}
      <div
        className="grid items-center border-b border-[#0C0C0C] px-3"
        style={{
          gridTemplateColumns: "1fr 0.8fr 1fr 1fr 1fr 0.8fr 1fr",
          height: "32px",
        }}
      >
        <div className="text-[#84858C] text-[12px]">Coin</div>
        <div className="text-[#84858C] text-[12px]">Side</div>
        <div className="text-[#84858C] text-[12px]">Type</div>
        <div className="text-[#84858C] text-[12px]">Price</div>
        <div className="text-[#84858C] text-[12px]">Size</div>
        <div className="text-[#84858C] text-[12px]">Status</div>
        <div className="text-[#84858C] text-[12px]">Time</div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-auto">
        {perpHistoricalOrders.map((item, index) => {
          const order = item.order;
          const isBuy = order.side === "B";
          const orderTime = new Date(order.timestamp);
          const statusTime = new Date(item.statusTimestamp);
          
          return (
            <div
              key={`${order.oid}-${index}`}
              className="grid items-center border-b border-[#0C0C0C] px-3 hover:bg-[#1C1D21] transition-colors"
              style={{
                gridTemplateColumns: "1fr 0.8fr 1fr 1fr 1fr 0.8fr 1fr",
                height: "48px",
              }}
            >
              {/* Coin */}
              <div className="flex items-center gap-2">
                {/* <div className="relative w-6 h-6">
                  <Image
                    src={`/coins/${order.coin.toLowerCase()}.png`}
                    alt={order.coin}
                    fill
                    className="rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = "/coins/default.png";
                    }}
                  />
                </div> */}
                <span className="text-white text-[12px] font-medium">{order.coin}</span>
              </div>

              {/* Side */}
              <div>
                <span
                  className={`text-[12px] font-medium px-2 py-1 rounded ${
                    isBuy
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {isBuy ? "Buy" : "Sell"}
                </span>
              </div>

              {/* Order Type */}
              <div className="text-white text-[12px]">
                {order.orderType}
                {order.reduceOnly && (
                  <span className="text-[#84858C] text-[10px] ml-1">(RO)</span>
                )}
              </div>

              {/* Price */}
              <div className="flex flex-col">
                <span className="text-white text-[12px]">
                  ${parseFloat(order.limitPx).toFixed(2)}
                </span>
                {order.isTrigger && order.triggerPx !== "0.0" && (
                  <span className="text-[#84858C] text-[10px]">
                    Trigger: ${parseFloat(order.triggerPx).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Size */}
              <div className="text-white text-[12px]">
                {parseFloat(order.origSz).toFixed(4)}
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <span className={`text-[12px] font-medium ${getStatusColor(item.status)}`}>
                  {formatStatus(item.status)}
                </span>
              </div>

              {/* Time */}
              <div className="flex flex-col">
                <span className="text-white text-[11px]">
                  {orderTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </span>
                <span className="text-[#84858C] text-[10px]">
                  {orderTime.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}