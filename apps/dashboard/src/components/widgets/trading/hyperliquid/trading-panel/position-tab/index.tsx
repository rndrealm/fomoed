"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import { useHyperliquidAllMids } from "@/services/queries/hyperliquid-dex";
import { useReadHyperLiquidTokens } from "@/services/queries/hyperliquid";
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { useSetAtom } from "jotai";
import { useClearingHouseState } from "../../../chart/trading-view/hyperliquid/use-clearinghouse-state";
import dashboard from "@/lib/assets/dashboard";

interface PositionData {
  coin: string;
  coinIcon: string;
  side: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  positionValue: number;
  unrealizedPnl: number;
  roe: number;
  leverage: number;
  liquidationPrice: number | null;
  marginUsed: number;
  fundingSinceOpen: number;
}

interface OpenPositionsTabProps {
  hideSmallBalances: boolean;
  userAddress: string;
}

const userAddress = "0x02eC6F09CF972caEBd171314AE1C5c1B30919a57";

export default function OpenPositionsTab() {
  const { clearingHouse } = useClearingHouseState(userAddress);
  const { data: allMids } = useHyperliquidAllMids(!!userAddress);

  const { data: tokensData } = useReadHyperLiquidTokens();
  const setSelectedToken = useSetAtom(selectedTokenAtom);

  const positions: PositionData[] = useMemo(() => {
    const positionList: PositionData[] = [];

    if (clearingHouse?.clearinghouseState?.assetPositions) {
      clearingHouse.clearinghouseState.assetPositions.forEach((assetPosition) => {
        if (assetPosition.type === "oneWay" && assetPosition.position) {
          const pos = assetPosition.position;
          const szi = parseFloat(pos.szi);

          if (szi === 0) return;

          const markPrice = allMids?.[pos.coin] ? parseFloat(allMids[pos.coin]) : parseFloat(pos.entryPx);
          const entryPrice = parseFloat(pos.entryPx);
          const positionValue = parseFloat(pos.positionValue);
          const unrealizedPnl = parseFloat(pos.unrealizedPnl);
          const liquidationPrice = pos.liquidationPx === null ? null : parseFloat(pos.liquidationPx);
          const marginUsed = parseFloat(pos.marginUsed);
          const fundingSinceOpen = parseFloat(pos.cumFunding?.sinceOpen || "0");

          let leverage = 1;
          if (pos.leverage && typeof pos.leverage === "object") {
            if ("value" in pos.leverage) {
              leverage = pos.leverage.value;
            }
          }

          const roe = parseFloat(pos.returnOnEquity) * 100;

          positionList.push({
            coin: pos.coin,
            coinIcon: `/coins/${pos.coin.toLowerCase()}.png`,
            side: szi > 0 ? "Long" : "Short",
            size: Math.abs(szi),
            entryPrice: entryPrice,
            markPrice: markPrice,
            positionValue: positionValue,
            unrealizedPnl: unrealizedPnl,
            roe: roe,
            leverage: leverage,
            liquidationPrice: liquidationPrice,
            marginUsed: marginUsed,
            fundingSinceOpen: fundingSinceOpen,
          });
        }
      });
    }

    return positionList;
  }, [clearingHouse, allMids]);

  const isLoading = !clearingHouse;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[375px]">
        <div className="text-[#84858C] text-[14px]">Loading positions...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Table */}
      <div className="flex-1 overflow-auto px-3">
        {positions.length === 0 ? (
          <div className="flex flex-col min-h-[300px] h-full items-center justify-center bg-[#191B20] rounded-[6px] my-1">
            <Image src={dashboard.noDeposits} alt="No balances" width={168} height={168} className="mb-4" />
            <p className="text-white text-[20px] font-semibold">No Positions</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "12%" }}>
                    Coin
                  </th>
                  <th className="text-right text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "8%" }}>
                    Size
                  </th>
                  <th className="text-right text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "10%" }}>
                    Position Value
                  </th>
                  <th className="text-right text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "9%" }}>
                    Entry Price
                  </th>
                  <th className="text-right text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "9%" }}>
                    Mark Price
                  </th>
                  <th className="text-right text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "10%" }}>
                    PNL ROE%
                  </th>
                  <th className="text-right text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "9%" }}>
                    Liq Price
                  </th>
                  <th className="text-right text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "8%" }}>
                    Margin
                  </th>
                  <th className="text-right text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "8%" }}>
                    Funding
                  </th>
                  <th className="text-right text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "8%" }}>
                    TP/SL
                  </th>
                  <th className="text-right text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "9%" }}>
                    Close All
                  </th>
                </tr>
              </thead>
            </table>
            <div
              style={{
                backgroundColor: "#191B20",
                borderRadius: "15px",
                border: "1px solid #222327",
                padding: "8px",
                marginTop: "8px",
              }}
            >
              <table className="w-full" style={{ borderSpacing: "0 10px", borderCollapse: "separate" }}>
                <tbody>
                  {positions.map((position, index) => (
                    <tr
                      key={`${position.coin}-${index}`}
                      className="hover:bg-[#1C1D21] transition-colors"
                      style={{ height: "24px" }}
                    >
                      {/* Coin */}
                      <td className="px-3" style={{ width: "12%" }}>
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            const token = tokensData?.allTokens?.find((t) => t.name === position.coin);
                            if (!token) return;
                            setSelectedToken(token);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-white text-[13px] font-medium">{position.coin}</span>
                            <span
                              className="text-[10px] font-medium"
                              style={{
                                width: "22px",
                                height: "16px",
                                borderRadius: "2px",
                                paddingTop: "1px",
                                paddingRight: "2px",
                                paddingBottom: "1px",
                                paddingLeft: "2px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: position.side === "Long" ? "#00AF58" : "#DC2626",
                                backgroundColor: position.side === "Long" ? "#233A2F" : "#574040",
                              }}
                            >
                              {position.leverage}x
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Size */}
                      <td
                        className="px-3 text-[12px] text-right"
                        style={{ color: position.side === "Long" ? "#00AF58" : "#DC2626", width: "8%" }}
                      >
                        {position.size.toFixed(4)}
                      </td>

                      {/* Position Value */}
                      <td className="px-3 text-white text-[12px] text-right" style={{ width: "10%" }}>
                        ${position.positionValue.toFixed(2)}
                      </td>

                      {/* Entry Price */}
                      <td className="px-3 text-white text-[12px] text-right" style={{ width: "9%" }}>
                        ${position.entryPrice.toFixed(2)}
                      </td>

                      {/* Mark Price */}
                      <td className="px-3 text-white text-[12px] text-right" style={{ width: "9%" }}>
                        ${position.markPrice.toFixed(2)}
                      </td>

                      {/* PNL ROE% */}
                      <td className="px-3 text-right" style={{ width: "10%" }}>
                        <span
                          className="text-[12px] font-medium whitespace-nowrap"
                          style={{ color: position.unrealizedPnl >= 0 ? "#00AF58" : "#DC2626" }}
                        >
                          ${position.unrealizedPnl >= 0 ? "+" : ""}
                          {position.unrealizedPnl.toFixed(2)} ({position.roe >= 0 ? "+" : ""}
                          {position.roe.toFixed(2)}%)
                        </span>
                      </td>

                      {/* Liq Price */}
                      <td className="px-3 text-white text-[12px] text-right" style={{ width: "9%" }}>
                        {position.liquidationPrice !== null ? `${position.liquidationPrice.toFixed(2)}` : "-"}
                      </td>

                      {/* Margin */}
                      <td className="px-3 text-white text-[12px] text-right" style={{ width: "8%" }}>
                        ${position.marginUsed.toFixed(2)}
                      </td>

                      {/* Funding */}
                      <td className="px-3 text-right" style={{ width: "8%" }}>
                        <span
                          className="text-[12px]"
                          style={{ color: position.fundingSinceOpen >= 0 ? "#00AF58" : "#DC2626" }}
                        >
                          ${position.fundingSinceOpen >= 0 ? "+" : ""}
                          {position.fundingSinceOpen.toFixed(2)}
                        </span>
                      </td>

                      {/* TP/SL */}
                      <td className="px-3 text-[#84858C] text-[12px] text-right" style={{ width: "8%" }}>
                        -
                      </td>

                      {/* Close All */}
                      <td className="px-3 text-right" style={{ width: "9%" }}>
                        <div className="flex items-center justify-end gap-1 text-[11px]">
                          <span className="text-white cursor-pointer hover:text-blue-400 underline">Limit</span>
                          <span className="text-[#84858C]">/</span>
                          <span className="text-white cursor-pointer hover:text-blue-400 underline">Market</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Summary Footer */}
      {positions.length > 0 && (
        <div className="border-t border-[#0C0C0C] px-3 py-2 bg-[#0E0E0E]">
          <div className="flex justify-between items-center">
            <span className="text-[#84858C] text-[12px]">Total Positions: {positions.length}</span>
            <div className="flex gap-4">
              <div>
                <span className="text-[#84858C] text-[12px]">Total Value: </span>
                <span className="text-white text-[12px] font-medium">
                  ${positions.reduce((sum, p) => sum + p.positionValue, 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#84858C] text-[12px]">Total PNL: </span>
                <span
                  className="text-[12px] font-medium"
                  style={{
                    color: positions.reduce((sum, p) => sum + p.unrealizedPnl, 0) >= 0 ? "#00AF58" : "#DC2626",
                  }}
                >
                  ${positions.reduce((sum, p) => sum + p.unrealizedPnl, 0) >= 0 ? "+" : ""}
                  {positions.reduce((sum, p) => sum + p.unrealizedPnl, 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#84858C] text-[12px]">Total Margin: </span>
                <span className="text-white text-[12px] font-medium">
                  ${positions.reduce((sum, p) => sum + p.marginUsed, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
