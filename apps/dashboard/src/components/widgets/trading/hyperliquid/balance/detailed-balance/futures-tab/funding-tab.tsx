"use client";
import React, { useMemo, useEffect } from "react";
import Image from "next/image";
import { useHyperliquidUserFunding } from "@/services/queries/hyperliquid-dex";
import { useFetchCoinStatsToken } from "@/services/queries/charts";
import { FundingData } from "@/services/queries/hyperliquid-dex/types";

interface FundingTabProps {
  userAddress: string;
  emptyStateComponent: React.ReactNode;
}

const FundingTab = ({ userAddress, emptyStateComponent }: FundingTabProps) => {
  const { mutate: fetchFunding, data: fundingData } =
    useHyperliquidUserFunding();
  const { data: coinStatsData } = useFetchCoinStatsToken();

  useEffect(() => {
    if (userAddress) {
      const endTime = Date.now();
      const startTime = endTime - 30 * 24 * 60 * 60 * 1000;
      fetchFunding({ userAddress, startTime, endTime });
    }
  }, [userAddress, fetchFunding]);

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

  const fundingHistory = useMemo(() => {
    if (!fundingData) return [];

    return fundingData.map((item: any): FundingData & { side: string } => {
      const delta = item.delta;
      const coinSymbol = delta.coin;
      const coinInfo = coinInfoMap[coinSymbol] || {
        name: coinSymbol,
        icon: "https://static.coinstats.app/coins/1650455771843.png",
      };

      const size = parseFloat(delta.szi);
      const side = size > 0 ? "Long" : "Short";

      return {
        coin: coinSymbol,
        name: coinInfo.name,
        icon: coinInfo.icon,
        fundingRate: (parseFloat(delta.fundingRate) * 100).toFixed(4) + "%",
        size: delta.szi,
        usdc: delta.usdc,
        time: item.time,
        hash: item.hash,
        side,
      };
    });
  }, [fundingData, coinInfoMap]);

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
        className="grid grid-cols-[15%_15%_12%_12%_15%_15%] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
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
        <div className="text-[#84858C] text-[12px] font-medium text-right">Size</div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">Position Side</div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">Payment</div>
        <div className="text-[#84858C] text-[12px] font-medium text-right">Rate</div>
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
        {fundingHistory.length === 0 ? (
          <>{emptyStateComponent}</>
        ) : (
          fundingHistory.map((funding: FundingData & { side: string }, index: number) => {
            const usdcAmount = parseFloat(funding.usdc);
            const isPaid = usdcAmount < 0;
            const isLong = funding.side === "Long";

            return (
              <div
                key={`${funding.hash}-${index}`}
                className="grid grid-cols-[15%_15%_12%_12%_15%_15%] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
                style={{
                  height: "48px",
                  paddingLeft: "12px",
                  paddingRight: "12px",
                }}
              >
                <div className="text-[#84858C] text-[12px]">
                  {formatTime(funding.time)}
                </div>

                <div className="flex items-center gap-2">
                  <Image
                    src={funding.icon}
                    alt={funding.name}
                    width={20}
                    height={20}
                    className="rounded-full"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://static.coinstats.app/coins/1650455771843.png";
                    }}
                  />
                  <span className="text-white text-[12px] font-medium">
                    {funding.coin}
                  </span>
                </div>

                <div className="text-white text-[12px] text-right">
                  {Math.abs(parseFloat(funding.size)).toFixed(4)}
                </div>

                <div
                  className={`text-[12px] text-right font-medium ${
                    isLong ? "text-[#00AF58]" : "text-[#DC2626]"
                  }`}
                >
                  {funding.side}
                </div>

                <div className="text-right">
                  <span
                    className={`text-[12px] font-medium ${
                      isPaid ? "text-[#DC2626]" : "text-[#00AF58]"
                    }`}
                  >
                    {isPaid ? "" : "+"}
                    {formatPrice(Math.abs(usdcAmount))}
                  </span>
                </div>

                <div className="text-white text-[12px] text-right">
                  {funding.fundingRate}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default FundingTab;