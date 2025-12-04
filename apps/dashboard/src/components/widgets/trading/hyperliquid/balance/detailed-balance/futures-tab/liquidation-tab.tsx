"use client";
import React, { useMemo, useEffect } from "react";
import Image from "next/image";
import { useHyperliquidUserNonFundingLedgerUpdates } from "@/services/queries/hyperliquid-dex";
import { useHyperliquidUserFills } from "@/services/queries/hyperliquid-dex";
import { useFetchCoinStatsToken } from "@/services/queries/charts";
import { LiquidationData } from "@/services/queries/hyperliquid-dex/types";

interface LiquidationTabProps {
  userAddress: string;
  emptyStateComponent: React.ReactNode;
}

const LiquidationTab = ({
  userAddress,
  emptyStateComponent,
}: LiquidationTabProps) => {
  const { mutate: fetchLedger, data: ledgerData } =
    useHyperliquidUserNonFundingLedgerUpdates();
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

  const liquidationFillsByHash = useMemo(() => {
    if (!fillsData) return {};
    const map: Record<string, { markPx: number; method: string }> = {};

    fillsData.forEach((fill: any) => {
      if (fill.liquidation) {
        map[fill.hash] = {
          markPx: fill.liquidation.markPx,
          method: fill.liquidation.method,
        };
      }
    });

    return map;
  }, [fillsData]);

  const liquidations = useMemo(() => {
    if (!ledgerData) return [];

    return ledgerData
      .filter((item: any) => item.delta.type === "liquidation")
      .map((item: any): LiquidationData & { side: string; markPrice?: number; marginType?: string } => {
        const delta = item.delta;
        const coinSymbol = delta.coin;

        const coinInfo = coinInfoMap[coinSymbol] || {
          name: coinSymbol,
          icon: "https://static.coinstats.app/coins/1650455771843.png",
        };

        const size = parseFloat(delta.szi);
        const side = size > 0 ? "Long" : "Short";

        const fillData = liquidationFillsByHash[item.hash];
        const markPrice = fillData?.markPx;
        
        const marginType = delta.leverageType || undefined;

        return {
          coin: coinSymbol,
          name: coinInfo.name,
          icon: coinInfo.icon,
          size: delta.szi,
          price: parseFloat(delta.px),
          pnl: parseFloat(delta.pnl),
          time: item.time,
          hash: item.hash,
          side,
          markPrice,
          marginType,
        };
      });
  }, [ledgerData, coinInfoMap, liquidationFillsByHash]);

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

  return (
    <>
      <div
        className="grid grid-cols-[13%_11%_9%_10%_9%_10%_10%_9%_10%] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
        style={{
          height: "40px",
          paddingTop: "12px",
          paddingBottom: "12px",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        <div className="text-[#84858C] text-[12px] font-medium">Time</div>
        <div className="text-[#84858C] text-[12px] font-medium">Market Pair</div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">
          Side
        </div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">
          Liq Type
        </div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">
          Size
        </div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">
          Price
        </div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">
          Mark Price
        </div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">
          Margin
        </div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">
          PNL
        </div>
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
        {liquidations.length === 0 ? (
          <>{emptyStateComponent}</>
        ) : (
          liquidations.map((l: LiquidationData & { side: string; markPrice?: number; marginType?: string }, index: number) => {
            const isLong = l.side === "Long";
            
            return (
              <div
                key={`${l.hash}-${index}`}
                className="grid grid-cols-[13%_11%_9%_10%_9%_10%_10%_9%_10%] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
                style={{
                  height: "48px",
                  paddingLeft: "12px",
                  paddingRight: "12px",
                }}
              >
                <div className="text-[#84858C] text-[12px]">
                  {formatTime(l.time)}
                </div>

                <div className="flex items-center gap-2">
                  <Image
                    src={l.icon}
                    alt={l.name}
                    width={20}
                    height={20}
                    className="rounded-full"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://static.coinstats.app/coins/1650455771843.png";
                    }}
                  />
                  <span className="text-white text-[12px] font-medium">
                    {l.coin}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[12px] font-medium ${
                      isLong ? "text-[#00AF58]" : "text-[#DC2626]"
                    }`}
                  >
                    {l.side}
                  </span>
                </div>

                <div className="text-white text-[12px] text-right">
                  Full
                </div>

                <div className="text-white text-[12px] text-right">
                  {Math.abs(parseFloat(l.size)).toFixed(4)}
                </div>

                <div className="text-white text-[12px] text-right">
                  {formatPrice(l.price)}
                </div>

                <div className="text-white text-[12px] text-right">
                  {l.markPrice ? formatPrice(l.markPrice) : "-"}
                </div>

                <div className="text-white text-[12px] text-right">
                  {l.marginType || "-"}
                </div>

                <div className="text-[#DC2626] text-[12px] text-right font-medium">
                  {formatPrice(l.pnl)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default LiquidationTab;