"use client";
import React, { useState } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useOpenOrders } from "../../../chart/trading-view/hyperliquid/use-open-orders";
import { RenderIf, ModalContainer } from "@/components/shared";
import { cn } from "@/lib/utils";
import { formatNumberToDecimalPoints } from "../../../chart/chart-header/stats";
import { useReadHyperLiquidTokens } from "@/services/queries/hyperliquid";
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { useSetAtom } from "jotai";
import { useAccount } from "wagmi";
import CancelAllOrders from "../modals/cancel-all-orders";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export function getOrderAction(coin: string, side: string, reduceOnly: boolean) {
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
  const { address, isConnected: isAccountConnected } = useAccount();
  const { isConnected, openOrders } = useOpenOrders(address);

  const { data: tokensData } = useReadHyperLiquidTokens();
  const setSelectedToken = useSetAtom(selectedTokenAtom);

  const ordersArray = openOrders?.orders || [];

  const isLoading = !isConnected;

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="overflow-auto no-scrollbar px-3 flex-1">
          <div className="bg-[#191B20] my-2 rounded-[15px] border border-[#222327] p-2">
            <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr className="border-b-[0.5px] border-[#191B20]">
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
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                    Price
                  </th>
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                    Reduce Only
                  </th>
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                    Trigger Conditions
                  </th>
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                    TP/SL
                  </th>
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrderId(null);
                        setIsCancelModalOpen(true);
                      }}
                      disabled={ordersArray.length === 0 || isLoading}
                      className="text-[#FFF0D3] leading-[1.35] text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel All
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                <RenderIf condition={isAccountConnected && isLoading}>
                  <tr>
                    <td colSpan={11} className="py-10">
                      <div className="flex justify-center w-full">
                        <Spinner variant="circle" className="text-[rgb(255,59,16)]" size={24} />
                      </div>
                    </td>
                  </tr>
                </RenderIf>
                <RenderIf condition={isAccountConnected && !isLoading && ordersArray?.length !== 0}>
                  {ordersArray?.map((item, index) => {
                    const time = `${new Date(item.timestamp).toLocaleDateString()} - ${new Date(item.timestamp).toLocaleTimeString()}`;
                    const sideColorClassName = item.side === "B" ? "text-[#00AF58]" : "text-[#F99185]";
                    const isSpot = item?.coin?.includes("@");

                    const originalSize = parseFloat(item?.origSz || "0");

                    const size = parseFloat(item?.sz || "0");

                    const price = parseFloat(item?.limitPx || "0");
                    const formattedPrice = formatNumberToDecimalPoints(price);

                    const orderValue = price * size;
                    const formattedOrderValue = formatNumberToDecimalPoints(orderValue, 2);

                    const resolvedSpotToken = isSpot
                      ? tokensData?.spot?.find((token) => token.name === item.coin) || null
                      : null;

                    const isMarket = item.orderType.toLowerCase().includes("market");

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
                              if (isSpot) {
                                setSelectedToken(resolvedSpotToken);
                                return;
                              }
                              const tokensArray = (isSpot ? tokensData?.spot : tokensData?.perp) || [];
                              const currentToken = tokensArray.find((token) => token.name === item?.coin);
                              if (!currentToken) return;
                              setSelectedToken(currentToken);
                            }}
                          >
                            <p className={cn("text-white text-xs font-medium leading-[1.35%]", sideColorClassName)}>
                              {resolvedSpotToken?.symbol || item?.coin}
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
                          {isMarket ? "Market" : formattedPrice}
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
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderId(item.oid);
                                setIsCancelModalOpen(true);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </RenderIf>

                <RenderIf condition={(!isLoading && ordersArray?.length === 0) || !isAccountConnected}>
                  <tr>
                    <td colSpan={12} className="">
                      <div className="flex flex-col min-h-[200px] h-full items-center justify-center bg-[#191B20] rounded-[6px] my-1">
                        <Image src={dashboard.noDeposits} alt="No balances" width={168} height={168} className="mb-4" />
                        <p className="text-white text-[20px] font-semibold">No Open Orders</p>
                      </div>
                    </td>
                  </tr>
                </RenderIf>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RenderIf condition={isCancelModalOpen}>
        <ModalContainer
          open={isCancelModalOpen}
          handleClose={() => {
            setIsCancelModalOpen(false);
            setSelectedOrderId(null);
          }}
          headerClassName="text-center w-full text-lg font-medium"
          hideX
          title={selectedOrderId === null ? "Cancel All Orders" : "Cancel Order"}
          className="!max-w-[462px] px-6 py-8 bg-[#141416] gap-0"
        >
          <CancelAllOrders
            toggleModal={() => {
              setIsCancelModalOpen(false);
              setSelectedOrderId(null);
            }}
            tokensData={tokensData}
            openOrders={
              selectedOrderId === null
                ? openOrders
                : { orders: openOrders?.orders?.filter((order) => order.oid === selectedOrderId) || [] }
            }
          />
        </ModalContainer>
      </RenderIf>
    </>
  );
}
