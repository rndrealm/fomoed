"use client";
import React from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useAccount } from "wagmi";
import { RenderIf } from "@/components/shared";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useReadHyperLiquidTokens } from "@/services/queries/hyperliquid";
import { useSetAtom } from "jotai";
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { cn } from "@/lib/utils";
import { useUserFills } from "../../../chart/trading-view/hyperliquid/use-user-fills";
import { formatNumberToDecimalPoints } from "../../../chart/chart-header/stats";
import { Dir } from "../../../chart/trading-view/hyperliquid/types";

export const directionColorMap = {
  "Open Long": "text-[#00AF58]",
  "Close Short": "text-[#00AF58]",
  Buy: "text-[#00AF58]",
  Sell: "text-[#F99185]",
  "Close Long": "text-[#F99185]",
  "Open Short": "text-[#F99185]",
};

export default function TradeHistory() {
  const { address, isConnected: isAccountConnected } = useAccount();
  const userAddress = address || "";

  const { isConnected, userFills } = useUserFills(userAddress);

  const { data: tokensData } = useReadHyperLiquidTokens();
  const setSelectedToken = useSetAtom(selectedTokenAtom);

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-auto scrollbar flex-1">
        <div className="bg-[#191B20] my-2 rounded-[15px] border border-[#222327] p-2">
          <table className="w-full" style={{ borderSpacing: "0 6px", borderCollapse: "separate" }}>
            <thead>
              <tr className="">
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">Time</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">Coin</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                  Direction
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">Price</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">Size</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                  Trade Value
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">Fee</th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                  Closed PNL
                </th>
              </tr>
            </thead>

            <tbody>
              <RenderIf condition={isAccountConnected && !isConnected}>
                <tr>
                  <td colSpan={12} className="py-10">
                    <div className="flex justify-center w-full">
                      <Spinner variant="circle" className="text-[rgb(255,59,16)]" size={24} />
                    </div>
                  </td>
                </tr>
              </RenderIf>
              <RenderIf condition={isAccountConnected && isConnected && userFills?.length !== 0}>
                {userFills
                  ?.slice()
                  .reverse()
                  .map((item, index) => {
                    const time = `${new Date(item?.time).toLocaleDateString()} - ${new Date(item?.time).toLocaleTimeString()}`;
                    const sideColorClassName = item?.side === "B" ? "text-[#00AF58]" : "text-[#F99185]";
                    const isSpot = item?.dir?.toLowerCase() === "buy" || item?.dir?.toLowerCase() === "sell";

                    const price = parseFloat(item?.px || "0");
                    const formattedPrice = formatNumberToDecimalPoints(price, price < 1 ? undefined : 1);

                    const size = parseFloat(item?.sz || "0");

                    const tradeValue = price * size;
                    const formattedTradeValue = formatNumberToDecimalPoints(tradeValue, 2);

                    const fee = parseFloat(item?.fee);
                    const formattedFee = formatNumberToDecimalPoints(fee, fee < 1 ? undefined : 1);

                    const pnl = parseFloat(item?.closedPnl || "0");
                    const formattedPnl = formatNumberToDecimalPoints(pnl, pnl < 1 ? undefined : 1);

                    const resolvedSpotToken = isSpot
                      ? tokensData?.spot?.find((token) => token.name === item.coin) || null
                      : null;

                    return (
                      <tr key={index} className="h-[24px] relative">
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">{time}</td>
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
                            directionColorMap[item?.dir],
                          )}
                          // style={{ color: directionColorMap[item?.dir] }}
                        >
                          {item?.dir}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {formattedPrice}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {item?.sz}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {formattedTradeValue} USDC
                        </td>

                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {formattedFee} {item?.feeToken}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {formattedPnl || "-0.01"} USDC
                        </td>
                      </tr>
                    );
                  })}
              </RenderIf>

              <RenderIf condition={!isAccountConnected || (isConnected && userFills?.length === 0)}>
                <tr>
                  <td colSpan={12} className="">
                    <div className="flex flex-col min-h-[200px] h-full items-center justify-center bg-[#191B20] rounded-[6px] my-1">
                      <Image src={dashboard.noDeposits} alt="No balances" width={168} height={168} className="mb-4" />
                      <p className="text-white text-[20px] font-semibold">No Data</p>
                    </div>
                  </td>
                </tr>
              </RenderIf>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
