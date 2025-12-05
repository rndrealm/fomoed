"use client";
import React from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useOpenOrders } from "../../../chart/trading-view/hyperliquid/use-open-orders";
import { RenderIf } from "@/components/shared";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { cn } from "@/lib/utils";
import { useAllMids } from "../../../chart/trading-view/hyperliquid/use-all-mids";
import { formatNumberToDecimalPoints } from "../../../chart/chart-header/stats";
import { useReadHyperLiquidTokens } from "@/services/queries/hyperliquid";
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { useSetAtom } from "jotai";
import { useAccount } from "wagmi";

function getOrderAction(coin: string, side: string, reduceOnly: boolean) {
  const isSpot = coin.includes("/");

  if (isSpot) {
    return side === "B" ? "Buy" : "Sell";
  }

  if (side === "B") {
    return reduceOnly ? "Close Short" : "Long";
  }

  if (side === "A") {
    return reduceOnly ? "Close Long" : "Short";
  }

  return "";
}

export default function OpenOrdersTab() {
  const { address } = useAccount();
  const { isConnected, openOrders } = useOpenOrders(address);
  const { allMids, isConnected: midsConnected } = useAllMids();

  const { data: tokensData } = useReadHyperLiquidTokens();
  const setSelectedToken = useSetAtom(selectedTokenAtom);

  const ordersArray = openOrders?.orders || [];

  const isLoading = !isConnected || !midsConnected;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="overflow-auto scrollbar flex-1">
        <div className="bg-[#191B20] my-2 rounded-[15px] border border-[#222327] p-2">
          <table className="w-full" style={{ borderSpacing: "0 6px", borderCollapse: "separate" }}>
            <thead>
              <tr className="">
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">Time</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">Type</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">Coin</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                  Direction
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">Size</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                  Original Size
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                  Order Value
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">Price</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                  Reduce Only
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                  Trigger Conditions
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">TP/SL</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                  Close All
                </th>
              </tr>
            </thead>

            <tbody>
              <RenderIf condition={isLoading}>
                <tr>
                  <td colSpan={12} className="py-10">
                    <div className="flex justify-center w-full">
                      <Spinner variant="circle" className="text-[rgb(255,59,16)]" size={24} />
                    </div>
                  </td>
                </tr>
              </RenderIf>
              <RenderIf condition={!isLoading && ordersArray?.length !== 0}>
                {ordersArray?.map((item, index) => {
                  const time = `${new Date(item.timestamp).toLocaleDateString()} - ${new Date(item.timestamp).toLocaleTimeString()}`;
                  const sideColorClassName = item.side === "B" ? "text-[#00AF58]" : "text-[#F99185]";
                  const isSpot = item?.coin?.includes("/");

                  const originalSize = parseFloat(item?.origSz || "0");

                  const size = parseFloat(item?.sz || "0");

                  const price = parseFloat(item?.limitPx || "0");
                  const formattedPrice = formatNumberToDecimalPoints(price);

                  const orderValue = price * size;
                  const formattedOrderValue = formatNumberToDecimalPoints(orderValue, 2);

                  return (
                    <tr key={index} className="h-[24px] relative">
                      <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">{time}</td>
                      <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                        {item?.orderType}
                      </td>
                      <td className="rounded-l-[10px] p-2">
                        <button
                          className="flex items-center gap-2"
                          type="button"
                          onClick={() => {
                            const tokensArray = (isSpot ? tokensData?.spot : tokensData?.perp) || [];
                            const currentToken = tokensArray.find((token) => token.name === item?.coin);
                            if (!currentToken) return;
                            setSelectedToken(currentToken);
                          }}
                        >
                          <p className={cn("text-white text-xs font-medium leading-[1.35%]", sideColorClassName)}>
                            {item?.coin}
                          </p>
                        </button>
                      </td>
                      <td
                        className={cn(
                          "text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap",
                          sideColorClassName,
                        )}
                      >
                        {getOrderAction(item?.coin, item?.side, item?.reduceOnly)}
                      </td>
                      <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                        {size || "-"}
                      </td>
                      <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                        {originalSize || "-"}
                      </td>
                      <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                        {orderValue ? formattedOrderValue : "-"}
                      </td>
                      <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                        {orderValue ? formattedPrice : "Market"}
                      </td>
                      <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                        <RenderIf condition={isSpot}>--</RenderIf>
                        <RenderIf condition={!isSpot}>{item?.reduceOnly ? "Yes" : "No"}</RenderIf>
                      </td>
                      <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                        {item?.triggerCondition}
                      </td>
                      <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">--</td>
                      <td className="text-[#FFF0D3] leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <button type="button">Cancel</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </RenderIf>

              <RenderIf condition={!isLoading && ordersArray?.length === 0}>
                <div className="flex flex-col min-h-[300px] h-full items-center justify-center bg-[#191B20] rounded-[6px] my-1">
                  <Image src={dashboard.noDeposits} alt="No balances" width={168} height={168} className="mb-4" />
                  <p className="text-white text-[20px] font-semibold">No Open Orders</p>
                </div>
              </RenderIf>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
