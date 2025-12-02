"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import { useHyperliquidClearinghouseState, useHyperliquidAllMids } from "@/services/queries/hyperliquid-dex";
import { useReadHyperLiquidTokens } from "@/services/queries/hyperliquid";
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { useSetAtom } from "jotai";
import { useClearingHouseState } from "../../../chart/trading-view/hyperliquid/use-clearinghouse-state";

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
}

interface OpenPositionsTabProps {
  hideSmallBalances: boolean;
  userAddress: string;
}

const userAddress = "0x02eC6F09CF972caEBd171314AE1C5c1B30919a57";

export default function OpenPositionsTab() {
  const { data: clearinghouseState, isLoading } = useHyperliquidClearinghouseState(userAddress, !!userAddress);
  const { data: allMids } = useHyperliquidAllMids(!!userAddress);

  const { clearingHouse } = useClearingHouseState(userAddress);

  const { data: tokensData } = useReadHyperLiquidTokens();
  const setSelectedToken = useSetAtom(selectedTokenAtom);

  const positions: PositionData[] = useMemo(() => {
    const positionList: PositionData[] = [];

    if (clearinghouseState?.assetPositions) {
      clearinghouseState.assetPositions.forEach((assetPosition) => {
        if (assetPosition.type === "oneWay" && assetPosition.position) {
          const pos = assetPosition.position;
          const szi = parseFloat(pos.szi);

          if (szi === 0) return;

          const markPrice = allMids?.[pos.coin] ? parseFloat(allMids[pos.coin]) : parseFloat(pos.entryPx);
          const entryPrice = parseFloat(pos.entryPx);
          const positionValue = parseFloat(pos.positionValue);
          const unrealizedPnl = parseFloat(pos.unrealizedPnl);
          const liquidationPrice = pos.liquidationPx === null ? null : parseFloat(pos.liquidationPx);

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
          });
        }
      });
    }

    return positionList;
  }, [clearinghouseState, allMids]);

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
      <div className="flex-1 overflow-auto">
        {positions.length === 0 ? (
          <div className="flex flex-col min-h-[300px] h-full items-center justify-center bg-[#191B20] rounded-[6px] my-1">
            <div className="text-[#84858C] text-[48px] mb-4">📊</div>
            <p className="text-white text-[20px] font-semibold">No open positions</p>
            <p className="text-[#84858C] text-[14px] mt-2">Your positions will appear here</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#0C0C0C]">
                <th className="text-left text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "17%" }}>
                  Coin
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "11%" }}>
                  Side
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "14%" }}>
                  Size
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "14%" }}>
                  Entry / Mark
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "14%" }}>
                  Position Value
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "14%" }}>
                  Unrealized PNL
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "11%" }}>
                  Leverage
                </th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position, index) => (
                <tr
                  key={`${position.coin}-${index}`}
                  className="border-b border-[#0C0C0C] hover:bg-[#1C1D21] transition-colors"
                  style={{ height: "56px" }}
                >
                  {/* Coin */}
                  <td className="px-3">
                    <div
                      className="flex items-center gap-2"
                      onClick={() => {
                        const token = tokensData?.allTokens?.find((t) => t.name === position.coin);
                        if (!token) return;
                        setSelectedToken(token);
                      }}
                    >
                      <span className="text-white text-[14px] font-medium">{position.coin}</span>
                    </div>
                  </td>

                  {/* Side */}
                  <td className="px-3">
                    <span
                      className={`text-[12px] font-medium px-2 py-1 rounded ${
                        position.side === "Long" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {position.side}
                    </span>
                  </td>

                  {/* Size */}
                  <td className="px-3 text-white text-[12px]">{position.size.toFixed(4)}</td>

                  {/* Entry / Mark Price */}
                  <td className="px-3">
                    <div className="flex flex-col">
                      <span className="text-white text-[12px]">${position.entryPrice.toFixed(2)}</span>
                      <span className="text-[#84858C] text-[10px]">${position.markPrice.toFixed(2)}</span>
                    </div>
                  </td>

                  {/* Position Value */}
                  <td className="px-3 text-white text-[12px]">${position.positionValue.toFixed(2)}</td>

                  {/* Unrealized PNL */}
                  <td className="px-3">
                    <div className="flex flex-col">
                      <span
                        className={`text-[12px] font-medium ${
                          position.unrealizedPnl >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        ${position.unrealizedPnl >= 0 ? "+" : ""}
                        {position.unrealizedPnl.toFixed(2)}
                      </span>
                      <span className={`text-[10px] ${position.roe >= 0 ? "text-green-500" : "text-red-500"}`}>
                        ({position.roe >= 0 ? "+" : ""}
                        {position.roe.toFixed(2)}%)
                      </span>
                    </div>
                  </td>

                  {/* Leverage */}
                  <td className="px-3 text-white text-[12px]">{position.leverage}x</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  className={`text-[12px] font-medium ${
                    positions.reduce((sum, p) => sum + p.unrealizedPnl, 0) >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  ${positions.reduce((sum, p) => sum + p.unrealizedPnl, 0) >= 0 ? "+" : ""}
                  {positions.reduce((sum, p) => sum + p.unrealizedPnl, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
