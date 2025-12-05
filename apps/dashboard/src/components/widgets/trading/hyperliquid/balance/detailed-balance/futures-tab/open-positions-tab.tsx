"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import {
  useHyperliquidAllMids,
  useHyperliquidMetaAndAssetCtxs,
} from "@/services/queries/hyperliquid-dex";
import { useFetchCoinStatsToken } from "@/services/queries/charts";
import { PositionData } from "@/services/queries/hyperliquid-dex/types";
import { useClearingHouseState } from "@/components/widgets/trading/chart/trading-view/hyperliquid/use-clearinghouse-state";

interface OpenPositionsTabProps {
  userAddress: string;
  emptyStateComponent: React.ReactNode;
}

const OpenPositionsTab = ({
  userAddress,
  emptyStateComponent,
}: OpenPositionsTabProps) => {
  const { clearingHouse } = useClearingHouseState(userAddress);
  const { data: allMids } = useHyperliquidAllMids();
  const { data: metaAndAssetCtxs } = useHyperliquidMetaAndAssetCtxs();
  const { data: coinStatsData } = useFetchCoinStatsToken();

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

  const fundingRatesMap = useMemo(() => {
    if (
      !metaAndAssetCtxs ||
      !Array.isArray(metaAndAssetCtxs) ||
      metaAndAssetCtxs.length < 2
    )
      return {};

    const [meta, assetCtxs] = metaAndAssetCtxs;
    const map: Record<string, string> = {};

    if (meta?.universe && Array.isArray(assetCtxs)) {
      meta.universe.forEach((asset: any, index: number) => {
        const ctx = assetCtxs[index];
        if (ctx && ctx.funding) {
          map[asset.name] = ctx.funding;
        }
      });
    }

    return map;
  }, [metaAndAssetCtxs]);

  const positions = useMemo(() => {
    if (
      !clearingHouse?.clearinghouseState?.assetPositions ||
      clearingHouse.clearinghouseState.assetPositions.length === 0
    ) {
      return [];
    }

    return clearingHouse.clearinghouseState.assetPositions.map(
      (position): PositionData => {
        const pos = position.position;
        const coinSymbol = pos.coin;
        const coinInfo = coinInfoMap[coinSymbol] || {
          name: coinSymbol,
          icon: "https://static.coinstats.app/coins/default.png",
        };

        const szi = parseFloat(pos.szi);
        const isLong = szi > 0;
        const size = Math.abs(szi);
        const entryPrice = parseFloat(pos.entryPx);
        const markPrice = allMids?.[coinSymbol]
          ? parseFloat(allMids[coinSymbol])
          : entryPrice;
        const positionValue = size * markPrice;
        const unrealizedPnl = parseFloat(pos.unrealizedPnl);
        const marginUsed = parseFloat(pos.marginUsed);
        const roe = parseFloat(pos.returnOnEquity) * 100;
        const liquidationPrice = pos.liquidationPx || "N/A";
        const fundingRate = fundingRatesMap[coinSymbol] || "0";

        const leverage =
          pos.leverage.type === "cross"
            ? pos.leverage.value
              ? `${pos.leverage.value}x`
              : "1x"
            : `${pos.leverage.value}x`;

        return {
          coin: coinSymbol,
          name: coinInfo.name,
          icon: coinInfo.icon,
          size: `${isLong ? "+" : "-"}${size.toFixed(4)}`,
          side: isLong ? "Long" : "Short",
          positionValue,
          entryPrice,
          markPrice,
          pnl: unrealizedPnl,
          roe,
          liquidationPrice,
          margin: marginUsed,
          leverage,
          fundingRate: (parseFloat(fundingRate) * 100).toFixed(4) + "%",
        };
      }
    );
  }, [clearingHouse, allMids, coinInfoMap, fundingRatesMap]);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (positions.length === 0) {
    return <>{emptyStateComponent}</>;
  }

  return (
    <>
      <div
        className="grid grid-cols-[12%_8%_10%_9%_9%_10%_9%_8%_8%_8%] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
        style={{
          height: "40px",
          paddingTop: "12px",
          paddingBottom: "12px",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        <div className="text-[#84858C] text-[12px] font-medium">Coin</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">
          Size
        </div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">
          Position Value
        </div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">
          Entry Price
        </div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">
          Mark Price
        </div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">
          PNL ROE%
        </div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">
          Liq Price
        </div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">
          Margin
        </div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">
          Funding
        </div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">
          TP/SL
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
        {positions.map((position) => {
          const isLong = position.side === "Long";
          const isProfitable = position.pnl >= 0;

          return (
            <div
              key={`${position.coin}-${position.entryPrice}-${position.size}`}
              className="grid grid-cols-[12%_8%_10%_9%_9%_10%_9%_8%_8%_8%] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
              style={{
                height: "48px",
                paddingLeft: "12px",
                paddingRight: "12px",
              }}
            >
              <div className="flex items-center gap-2">
                <Image
                  src={position.icon}
                  alt={position.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://static.coinstats.app/coins/default.png";
                  }}
                />
                <span className="text-white text-[13px] font-medium">
                  {position.coin}
                </span>
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
                    color: isLong ? "#00AF58" : "#DC2626",
                    backgroundColor: isLong ? "#233A2F" : "#574040",
                  }}
                >
                  {position.leverage}
                </span>
              </div>

              <span
                className="text-[12px]"
                style={{ color: isLong ? "#00AF58" : "#DC2626" }}
              >
                {Math.abs(parseFloat(position.size)).toFixed(4)}
              </span>

              <span className="text-white text-[12px]">
                {formatPrice(position.positionValue)}
              </span>

              <span className="text-white text-[12px]">
                {formatPrice(position.entryPrice)}
              </span>

              <span className="text-white text-[12px]">
                {formatPrice(position.markPrice)}
              </span>

              <span
                className="text-[12px] font-medium"
                style={{ color: isProfitable ? "#00AF58" : "#DC2626" }}
              >
                {formatPrice(position.pnl)} ({isProfitable ? "+" : ""}
                {position.roe.toFixed(2)}%)
              </span>

              <span className="text-white text-[12px]">
                {position.liquidationPrice === "N/A"
                  ? "-"
                  : formatPrice(parseFloat(position.liquidationPrice))}
              </span>

              <span className="text-white text-[12px]">
                {formatPrice(position.margin)}
              </span>

              <span className="text-white text-[12px]">
                {position.fundingRate}
              </span>

              <span className="text-[#84858C] text-[12px]">-</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default OpenPositionsTab;