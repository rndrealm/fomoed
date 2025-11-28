"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useHyperliquidClearinghouseState, useHyperliquidAllMids } from "@/services/queries/hyperliquid-dex";

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

interface BalancesTabProps {
  hideSmallBalances: boolean;
  userAddress: string;
}

export default function BalancesTab({ hideSmallBalances, userAddress }: BalancesTabProps) {
  const { data: clearinghouseState, isLoading } = useHyperliquidClearinghouseState(userAddress, !!userAddress);
  const { data: allMids } = useHyperliquidAllMids(!!userAddress);

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

  const filteredPositions = hideSmallBalances ? positions.filter((position) => position.positionValue > 1) : positions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[375px]">
        <div className="text-[#84858C] text-[14px]">Loading positions...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Table Header */}
      <div
        className="grid items-center border-b border-[#0C0C0C] px-3"
        style={{
          gridTemplateColumns: "1.2fr 0.8fr 1fr 1fr 1fr 1fr 0.8fr",
          height: "32px",
        }}
      >
        <div className="text-[#84858C] text-[12px]">Coin</div>
        <div className="text-[#84858C] text-[12px]">Side</div>
        <div className="text-[#84858C] text-[12px]">Size</div>
        <div className="text-[#84858C] text-[12px]">Entry / Mark</div>
        <div className="text-[#84858C] text-[12px]">Position Value</div>
        <div className="text-[#84858C] text-[12px]">Unrealized PNL</div>
        <div className="text-[#84858C] text-[12px]">Leverage</div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-auto">
        {filteredPositions.length === 0 ? (
          <div className="flex flex-col min-h-[375px] h-full items-center justify-center bg-[#191B20] rounded-[6px] my-1">
            <Image src={dashboard.noDeposits} alt="No balances" width={168} height={168} className="mb-4" />
            <p className="text-white text-[20px] font-semibold">No balances to display</p>
          </div>
        ) : (
          filteredPositions.map((position, index) => (
            <div
              key={`${position.coin}-${index}`}
              className="grid items-center border-b border-[#0C0C0C] px-3 hover:bg-[#1C1D21] transition-colors"
              style={{
                gridTemplateColumns: "1.2fr 0.8fr 1fr 1fr 1fr 1fr 0.8fr",
                height: "56px",
              }}
            >
              {/* Coin */}
              <div className="flex items-center gap-2">
                {/* <div className="relative w-6 h-6">
                  <Image
                    src={position.coinIcon}
                    alt={position.coin}
                    fill
                    className="rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = "/coins/default.png";
                    }}
                  />
                </div> */}
                <span className="text-white text-[14px] font-medium">{position.coin}</span>
              </div>

              {/* Side */}
              <div>
                <span
                  className={`text-[12px] font-medium px-2 py-1 rounded ${
                    position.side === "Long" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {position.side}
                </span>
              </div>

              {/* Size */}
              <div className="text-white text-[12px]">{position.size.toFixed(4)}</div>

              {/* Entry / Mark Price */}
              <div className="flex flex-col">
                <span className="text-white text-[12px]">${position.entryPrice.toFixed(2)}</span>
                <span className="text-[#84858C] text-[10px]">${position.markPrice.toFixed(2)}</span>
              </div>

              {/* Position Value */}
              <div className="text-white text-[12px]">${position.positionValue.toFixed(2)}</div>

              {/* Unrealized PNL */}
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

              {/* Leverage */}
              <div className="text-white text-[12px]">{position.leverage}x</div>
            </div>
          ))
        )}
      </div>

      {/* Summary Footer (Optional) */}
      {filteredPositions.length > 0 && (
        <div className="border-t border-[#0C0C0C] px-3 py-2 bg-[#0E0E0E]">
          <div className="flex justify-between items-center">
            <span className="text-[#84858C] text-[12px]">Total Positions: {filteredPositions.length}</span>
            <div className="flex gap-4">
              <div>
                <span className="text-[#84858C] text-[12px]">Total Value: </span>
                <span className="text-white text-[12px] font-medium">
                  ${filteredPositions.reduce((sum, p) => sum + p.positionValue, 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#84858C] text-[12px]">Total PNL: </span>
                <span
                  className={`text-[12px] font-medium ${
                    filteredPositions.reduce((sum, p) => sum + p.unrealizedPnl, 0) >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  ${filteredPositions.reduce((sum, p) => sum + p.unrealizedPnl, 0) >= 0 ? "+" : ""}
                  {filteredPositions.reduce((sum, p) => sum + p.unrealizedPnl, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
