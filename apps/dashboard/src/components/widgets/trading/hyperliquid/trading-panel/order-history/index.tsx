"use client";
import React from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useHyperliquidHistoricalOrders } from "@/services/queries/hyperliquid-dex";
import { useAccount } from "wagmi";

export default function OrderHistoryTab() {
  const { address } = useAccount();
  const userAddress = address || "";

  const { data: historicalOrders, isLoading } = useHyperliquidHistoricalOrders(userAddress, !!userAddress);

  const perpHistoricalOrders = historicalOrders?.filter((item) => !item.order.coin.startsWith("@")) || [];

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

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    
    return `${mm}/${dd}/${yyyy} - ${hh}:${min}:${ss}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto px-3 no-scrollbar">
        <div className="my-2">
          <table className="w-full" style={{ borderSpacing: "0", borderCollapse: "separate" }}>
            <thead>
              <tr className="border-b-[0.5px] border-[#191B20]">
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap w-[12%]">Coin</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap w-[12%]">Side</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap w-[12%]">Type</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap w-[15%]">Price</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap w-[12%]">Size</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap w-[12%]">Status</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap w-[25%]">Time</th>
              </tr>
            </thead>

            <tbody className="bg-[#191B20] border border-[#222327]">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-10">
                    <div className="flex justify-center w-full">
                      <div className="text-[#84858C] text-[14px]">Loading order history...</div>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && perpHistoricalOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10">
                    <div className="flex flex-col items-center justify-center">
                      <Image src={dashboard.noOpenOrders} alt="No Order History" width={168} height={168} className="mb-4" />
                      <p className="text-white text-[20px] font-semibold">No Order History</p>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && perpHistoricalOrders.map((item, index) => {
                const order = item.order;
                const isBuy = order.side === "B";
                const isFirstRow = index === 0;
                const isLastRow = index === perpHistoricalOrders.length - 1;

                return (
                  <tr
                    key={`${order.oid}-${index}`}
                    className="h-[48px] hover:bg-[#1C1D21] transition-colors"
                  >
                    {/* Coin */}
                    <td className={`text-white text-xs font-medium px-2 py-2 whitespace-nowrap w-[12%] ${
                      isFirstRow ? 'rounded-tl-[15px]' : ''
                    } ${
                      isLastRow ? 'rounded-bl-[15px]' : ''
                    }`}>
                      {order.coin}
                    </td>

                    {/* Side */}
                    <td className="px-2 py-2 whitespace-nowrap w-[12%]">
                      <span
                        className={`text-[12px] font-medium px-2 py-1 rounded ${
                          isBuy ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {isBuy ? "Buy" : "Sell"}
                      </span>
                    </td>

                    {/* Order Type */}
                    <td className="text-white text-xs px-2 py-2 whitespace-nowrap w-[12%]">
                      {order.orderType}
                      {order.reduceOnly && <span className="text-[#84858C] text-[10px] ml-1">(RO)</span>}
                    </td>

                    {/* Price */}
                    <td className="px-2 py-2 whitespace-nowrap w-[15%]">
                      <div className="flex flex-col">
                        <span className="text-white text-xs">${parseFloat(order.limitPx).toFixed(2)}</span>
                        {order.isTrigger && order.triggerPx !== "0.0" && (
                          <span className="text-[#84858C] text-[10px]">
                            Trigger: ${parseFloat(order.triggerPx).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Size */}
                    <td className="text-white text-xs px-2 py-2 whitespace-nowrap w-[12%]">
                      {parseFloat(order.origSz).toFixed(4)}
                    </td>

                    {/* Status */}
                    <td className="px-2 py-2 whitespace-nowrap w-[12%]">
                      <span className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                        {formatStatus(item.status)}
                      </span>
                    </td>

                    {/* Time */}
                    <td className={`px-2 py-2 whitespace-nowrap w-[25%] ${
                      isFirstRow ? 'rounded-tr-[15px]' : ''
                    } ${
                      isLastRow ? 'rounded-br-[15px]' : ''
                    }`}>
                      <span className="text-white text-[11px]">
                        {formatDateTime(order.timestamp)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}