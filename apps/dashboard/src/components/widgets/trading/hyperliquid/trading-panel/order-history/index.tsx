import React from "react";
import { useHistoricalOrders } from "../../../chart/trading-view/hyperliquid/use-historical-orders";
import { useAccount } from "wagmi";
import { RenderIf } from "@/components/shared";
import { useReadHyperLiquidTokens } from "@/services/queries/hyperliquid";
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { useSetAtom } from "jotai";
import { cn } from "@/lib/utils";
import { directionColorMap } from "../trade-history";
import { formatNumberToDecimalPoints } from "../../../chart/chart-header/stats";

function getTradeType(isSpot: boolean, side: string, reduceOnly: boolean) {
  if (isSpot) {
    return side === "B" ? "Buy" : "Sell";
  }

  if (side === "B") {
    return reduceOnly ? "Close Short" : "Open Long";
  } else {
    return reduceOnly ? "Close Long" : "Open Short";
  }
}

export default function OrderHistory() {
  const { address } = useAccount();
  const userAddress = address || "";

  const { isConnected, orderHistory } = useHistoricalOrders(address);

  const { data: tokensData } = useReadHyperLiquidTokens();
  const setSelectedToken = useSetAtom(selectedTokenAtom);

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
                  Filled Size
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
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">Status</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                  Order ID
                </th>
              </tr>
            </thead>

            <tbody>
              <RenderIf condition={isConnected && orderHistory?.length !== 0}>
                {orderHistory
                  ?.slice()
                  .reverse()
                  .map((item, index) => {
                    const time = `${new Date(item?.statusTimestamp).toLocaleDateString()} - ${new Date(item?.statusTimestamp).toLocaleTimeString()}`;

                    const isSpot = item?.order?.coin?.indexOf("@") > -1 || item?.order?.coin === "PURR/USDC";
                    const direction = getTradeType(isSpot, item?.order?.side, item?.order?.reduceOnly);

                    const size = parseFloat(item?.order?.sz || "0");
                    const originalSize = parseFloat(item?.order?.origSz || "0");
                    const formattedSize = formatNumberToDecimalPoints(size, size < 1 ? undefined : 1);

                    const filledSize = originalSize - size;
                    const formattedFilledSize = formatNumberToDecimalPoints(filledSize, filledSize < 1 ? undefined : 1);

                    const limitPrice = parseFloat(item?.order?.limitPx || "0");
                    const formattedPrice = formatNumberToDecimalPoints(limitPrice, limitPrice < 1 ? undefined : 1);

                    const orderValue = limitPrice * size;
                    const formattedOrderValue = formatNumberToDecimalPoints(orderValue, 2);

                    const triggerPrice = parseFloat(item?.order?.triggerPx || "0");
                    const formattedTriggerPrice = formatNumberToDecimalPoints(
                      triggerPrice,
                      triggerPrice < 1 ? undefined : 1,
                    );

                    const resolvedSpotToken = isSpot
                      ? tokensData?.spot?.find((token) => token.name === item?.order?.coin) || null
                      : null;

                    return (
                      <tr key={index} className="h-[24px] relative">
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">{time}</td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {item?.order?.orderType}
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
                              const currentToken = tokensArray.find((token) => token.name === item?.order?.coin);
                              if (!currentToken) return;
                              setSelectedToken(currentToken);
                            }}
                          >
                            <p
                              className={cn(
                                "text-white text-xs font-medium leading-[1.35%]",
                                directionColorMap[direction],
                              )}
                            >
                              {resolvedSpotToken?.symbol || item?.order?.coin}
                            </p>
                          </button>
                        </td>
                        <td
                          className={cn(
                            "text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap",
                            directionColorMap[direction],
                          )}
                        >
                          {direction}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {size ? formattedSize : "--"}
                        </td>

                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {filledSize ? formattedFilledSize : "--"}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {orderValue ? `${formattedOrderValue} USDC` : "--"}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {triggerPrice ? "Market" : formattedPrice}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {isSpot ? "--" : item?.order?.reduceOnly ? "Yes" : "No"}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {item?.order?.triggerCondition || "N/A"}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {item?.order?.isPositionTpsl ? "--" : "--"}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap capitalize">
                          {item?.status}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {item?.order?.oid}
                        </td>
                      </tr>
                    );
                  })}
              </RenderIf>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}