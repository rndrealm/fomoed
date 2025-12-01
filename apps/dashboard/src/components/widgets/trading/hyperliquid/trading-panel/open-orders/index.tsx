"use client";
import React from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useOpenOrders } from "../../../chart/trading-view/hyperliquid/use-open-orders";
import { RenderIf } from "@/components/shared";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

interface OpenOrdersTabProps {
  userAddress: string;
}

const userAddress = "0x02eC6F09CF972caEBd171314AE1C5c1B30919a57";

export default function OpenOrdersTab() {
  const { isConnected, openOrders } = useOpenOrders(userAddress);

  const ordersArray = openOrders?.orders || [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="sticky top-0 bg-[#191B20] z-10">
            <tr className="border-b border-[#0C0C0C]">
              <th className="text-[#84858C] text-[12px] font-normal text-left px-3 py-2">Coin</th>
              <th className="text-[#84858C] text-[12px] font-normal text-left px-3 py-2">Side</th>
              <th className="text-[#84858C] text-[12px] font-normal text-left px-3 py-2">Type</th>
              <th className="text-[#84858C] text-[12px] font-normal text-left px-3 py-2">Price</th>
              <th className="text-[#84858C] text-[12px] font-normal text-left px-3 py-2">Size</th>
              <th className="text-[#84858C] text-[12px] font-normal text-left px-3 py-2">Filled</th>
              <th className="text-[#84858C] text-[12px] font-normal text-left px-3 py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            <RenderIf condition={!isConnected}>
              <tr>
                <td colSpan={7}>
                  <div className="flex justify-center items-center py-2">
                    <Spinner className="text-[rgb(255,59,16)]" size={28} />
                  </div>
                </td>
              </tr>
            </RenderIf>
            <RenderIf condition={isConnected && ordersArray.length !== 0}>
              {ordersArray.map((order, index) => {
                if (!order || !order.coin) return null;

                const isBuy = order.side === "B";
                const isSpot = !order.coin.startsWith("@") || order.coin.includes("/");
                const filledSize = parseFloat(order.origSz) - parseFloat(order.sz);
                const fillPercentage = (filledSize / parseFloat(order.origSz)) * 100;
                const orderTime = new Date(order.timestamp);

                let sideLabel = "";
                let sideColor = "";
                if (isSpot) {
                  sideLabel = isBuy ? "Buy" : "Sell";
                  sideColor = isBuy ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500";
                } else {
                  sideLabel = isBuy ? "Long" : "Short";
                  sideColor = isBuy ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500";
                }

                return (
                  <tr
                    key={`${order.oid}-${index}`}
                    className="border-b border-[#0C0C0C] hover:bg-[#1C1D21] transition-colors"
                  >
                    {/* Coin */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-[12px] font-medium">{order.coin}</span>
                      </div>
                    </td>

                    {/* Side */}
                    <td className="px-3 py-3">
                      <span className={`text-[12px] font-medium px-2 py-1 rounded inline-block ${sideColor}`}>
                        {sideLabel}
                      </span>
                    </td>

                    {/* Order Type */}
                    <td className="px-3 py-3">
                      <div className="text-white text-[12px]">
                        {order.orderType}
                        {order.reduceOnly && <span className="text-[#84858C] text-[10px] ml-1">(RO)</span>}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="text-white text-[12px]">${parseFloat(order.limitPx).toFixed(2)}</span>
                        {order.isTrigger && order.triggerPx !== "0.0" && (
                          <span className="text-[#84858C] text-[10px]">
                            Trigger: ${parseFloat(order.triggerPx).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-3 py-3">
                      <div className="text-white text-[12px]">
                        {parseFloat(order.sz).toFixed(4)}
                        <span className="text-[#84858C] text-[10px] ml-1">/ {parseFloat(order.origSz).toFixed(4)}</span>
                      </div>
                    </td>

                    {/* Filled */}
                    <td className="px-3 py-3">
                      <span className="text-white text-[12px]">{fillPercentage.toFixed(0)}%</span>
                    </td>

                    {/* Time */}
                    <td className="px-3 py-3">
                      <span className="text-[#84858C] text-[11px]">
                        {orderTime.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </RenderIf>

            <RenderIf condition={isConnected && ordersArray.length === 0}>
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col justify-center items-center py-2 pt-4">
                    <Image
                      src={dashboard.noOpenOrders}
                      alt="No Open Orders"
                      width={168}
                      height={168}
                      className="mb-4"
                    />
                    <p className="text-white text-[20px] font-semibold">No Open Orders</p>
                  </div>
                </td>
              </tr>
            </RenderIf>
          </tbody>
        </table>
      </div>
    </div>
  );
}
