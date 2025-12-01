"use client";
import React from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useHyperliquidOpenOrders } from "@/services/queries/hyperliquid-dex";
import { useOpenOrders } from "../../../chart/trading-view/hyperliquid/use-open-orders";
import { useClearingHouseState } from "../../../chart/trading-view/hyperliquid/use-clearinghouse-state";

interface OpenOrdersTabProps {
  userAddress: string;
}

export default function OpenOrdersTab({ userAddress }: OpenOrdersTabProps) {
  const { data: openOrders, isLoading } = useHyperliquidOpenOrders(userAddress, !!userAddress);

  const { isConnected, openOrders: openOrdersFromHook } = useOpenOrders(userAddress);

  const perpOpenOrders = openOrders?.filter((order) => !order.coin.startsWith("@")) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[375px]">
        <div className="text-[#84858C] text-[14px]">Loading orders...</div>
      </div>
    );
  }

  if (perpOpenOrders.length === 0) {
    return (
      <div className="flex flex-col min-h-[375px] h-full items-center justify-center bg-[#191B20] rounded-[6px] my-1">
        <Image src={dashboard.noOpenOrders} alt="No Open Orders" width={168} height={168} className="mb-4" />
        <p className="text-white text-[20px] font-semibold">No Open Orders</p>
      </div>
    );
  }

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
        <div className="text-[#84858C] text-[12px]">Filled</div>
        <div className="text-[#84858C] text-[12px]">Time</div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-auto">
        {perpOpenOrders.map((order, index) => {
          const isBuy = order.side === "B";
          const filledSize = parseFloat(order.origSz) - parseFloat(order.sz);
          const fillPercentage = (filledSize / parseFloat(order.origSz)) * 100;
          const orderTime = new Date(order.timestamp);

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
                    isBuy ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {isBuy ? "Buy" : "Sell"}
                </span>
              </div>

              {/* Order Type */}
              <div className="text-white text-[12px]">
                {order.orderType}
                {order.reduceOnly && <span className="text-[#84858C] text-[10px] ml-1">(RO)</span>}
              </div>

              {/* Price */}
              <div className="flex flex-col">
                <span className="text-white text-[12px]">${parseFloat(order.limitPx).toFixed(2)}</span>
                {order.isTrigger && order.triggerPx !== "0.0" && (
                  <span className="text-[#84858C] text-[10px]">Trigger: ${parseFloat(order.triggerPx).toFixed(2)}</span>
                )}
              </div>

              {/* Size */}
              <div className="text-white text-[12px]">
                {parseFloat(order.sz).toFixed(4)}
                <span className="text-[#84858C] text-[10px] ml-1">/ {parseFloat(order.origSz).toFixed(4)}</span>
              </div>

              {/* Filled */}
              <div className="text-white text-[12px]">{fillPercentage.toFixed(0)}%</div>

              {/* Time */}
              <div className="text-[#84858C] text-[11px]">
                {orderTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
