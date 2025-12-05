"use client";
import React, { useMemo, useEffect } from "react";
import Image from "next/image";
import { useHyperliquidUserNonFundingLedgerUpdates } from "@/services/queries/hyperliquid-dex";
import { useHyperliquidUserFills } from "@/services/queries/hyperliquid-dex";
import { useFetchCoinStatsToken } from "@/services/queries/charts";
import { PositionHistoryData } from "@/services/queries/hyperliquid-dex/types";

interface PositionHistoryTabProps {
  userAddress: string;
  emptyStateComponent: React.ReactNode;
}

const PositionHistoryTab = ({ userAddress, emptyStateComponent }: PositionHistoryTabProps) => {
  const { mutate: fetchLedger, data: ledgerData } = useHyperliquidUserNonFundingLedgerUpdates();
  const { data: fillsData } = useHyperliquidUserFills(userAddress, !!userAddress);
  const { data: coinStatsData } = useFetchCoinStatsToken();

  useEffect(() => {
    if (userAddress) {
      const endTime = Date.now();
      const startTime = endTime - 90 * 24 * 60 * 60 * 1000;
      fetchLedger({ userAddress, startTime, endTime });
    }
  }, [userAddress, fetchLedger]);

  const coinInfoMap = useMemo(() => {
    if (!coinStatsData) return {};
    const map: Record<string, { name: string; icon: string }> = {};
    coinStatsData.forEach((coin) => {
      map[coin.symbol.toUpperCase()] = {
        name: coin.name,
        icon: coin.icon,
      };
    });
    return map;
  }, [coinStatsData]);

  const fillsByHash = useMemo(() => {
    if (!fillsData) return {};
    const map: Record<string, number> = {};

    fillsData.forEach((fill: any) => {
      const hash = fill.hash;
      const fee = parseFloat(fill.fee || "0");

      if (map[hash]) {
        map[hash] += fee;
      } else {
        map[hash] = fee;
      }
    });

    return map;
  }, [fillsData]);

  const positionHistory = useMemo<Array<PositionHistoryData & { fee: number }>>(() => {
    if (!ledgerData) return [];

    return ledgerData
      .filter((item: any) => item.delta.type === "position")
      .map((item: any): PositionHistoryData & { fee: number } => {
        const delta = item.delta;
        const coinSymbol = delta.coin;

        const coinInfo = coinInfoMap[coinSymbol] || {
          name: coinSymbol,
          icon: "https://static.coinstats.app/coins/1650455771843.png",
        };

        const size = parseFloat(delta.szi);
        const side = size > 0 ? "Long" : "Short";

        const fee = fillsByHash[item.hash] || 0;

        return {
          coin: coinSymbol,
          name: coinInfo.name,
          icon: coinInfo.icon,
          size: delta.szi,
          side,
          entryPrice: parseFloat(delta.entryPx),
          exitPrice: parseFloat(delta.exitPx),
          pnl: parseFloat(delta.pnl),
          time: item.time,
          hash: item.hash,
          fee,
        };
      });
  }, [ledgerData, coinInfoMap, fillsByHash]);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);

    const pad = (n: number) => n.toString().padStart(2, "0");

    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const year = date.getFullYear();

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${month}/${day}/${year} - ${hours}:${minutes}:${seconds}`;
  };

  const calculateTradeValue = (size: string, price: number) => {
    return Math.abs(parseFloat(size)) * price;
  };

  return (
    <>
      <div
        className="grid grid-cols-[15%_11%_10%_11%_11%_11%_10%_12%] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
        style={{
          height: "40px",
          paddingTop: "12px",
          paddingBottom: "12px",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        <div className="text-[#84858C] text-[12px] font-medium">Time</div>
        <div className="text-[#84858C] text-[12px] font-medium">Coin</div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">Direction</div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">Price</div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">Size</div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">Trade Value</div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">Fee</div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">Close PNL</div>
      </div>

      <div
        className="flex-1 overflow-auto no-scrollbar"
        style={{
          backgroundColor: "#191B20",
          borderRadius: "15px",
          border: "1px solid #222327",
          padding: "8px",
          marginTop: "8px",
        }}
      >
        {positionHistory.length === 0 ? (
          <>{emptyStateComponent}</>
        ) : (
          positionHistory.map((p, index: number) => {
            const isProfit = p.pnl >= 0;
            const tradeValue = calculateTradeValue(p.size, p.exitPrice);

            return (
              <div
                key={`${p.hash}-${index}`}
                className="grid grid-cols-[15%_11%_10%_11%_11%_11%_10%_12%] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
                style={{
                  height: "48px",
                  paddingLeft: "12px",
                  paddingRight: "12px",
                }}
              >
                <div className="text-[#84858C] text-[12px]">{formatTime(p.time)}</div>

                <div className="flex items-center gap-[12px]">
                  <Image src={p.icon} alt={p.name} width={32} height={32} className="rounded-full" />
                  <span className="text-white text-[12px]">{p.name}</span>
                </div>

                <div
                  className={`text-[12px] text-right font-medium ${
                    p.side === "Long" ? "text-[#00AF58]" : "text-[#DC2626]"
                  }`}
                >
                  {p.side}
                </div>

                <div className="text-white text-[12px] text-right">{formatPrice(p.exitPrice)}</div>

                <div className="text-white text-[12px] text-right">{Math.abs(parseFloat(p.size)).toFixed(4)}</div>

                <div className="text-white text-[12px] text-right">{formatPrice(tradeValue)}</div>

                <div className="text-[#84858C] text-[12px] text-right">{formatPrice(p.fee)}</div>

                <div className={`text-[12px] text-right font-medium ${isProfit ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
                  {isProfit ? "+" : ""}
                  {formatPrice(p.pnl)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default PositionHistoryTab;