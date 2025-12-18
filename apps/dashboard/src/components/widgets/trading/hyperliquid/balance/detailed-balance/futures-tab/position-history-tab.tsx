"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import { useHyperliquidUserFills } from "@/services/queries/hyperliquid-dex";
import { useAccount } from "wagmi";
import { useFetchCoinStatsToken } from "@/services/queries/charts";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

interface PositionHistoryTabProps {
  userAddress: string;
  emptyStateComponent: React.ReactNode;
}

const PositionHistoryTab = ({ userAddress, emptyStateComponent }: PositionHistoryTabProps) => {
  const { address, isConnected: isAccountConnected } = useAccount();
  const userAddressUsed = address || userAddress;

  const { data: fillsData, isLoading } = useHyperliquidUserFills(userAddressUsed, !!userAddressUsed);
  const { data: coinStatsData } = useFetchCoinStatsToken();

  // Create coin info map from CoinStats data
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

  // Filter fills to only show closed positions (those with closedPnl)
  const closedPositions = useMemo(() => {
    if (!fillsData) return [];
    
    return fillsData.filter((fill) => {
      const pnl = parseFloat(fill?.closedPnl || "0");
      return pnl !== 0; // Only show fills that closed a position
    });
  }, [fillsData]);

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

  const getCoinIcon = (coinName: string) => {
    const coinInfo = coinInfoMap[coinName.toUpperCase()];
    return coinInfo?.icon || "https://static.coinstats.app/coins/1650455771843.png";
  };

  const getCoinDisplayName = (coinName: string) => {
    const coinInfo = coinInfoMap[coinName.toUpperCase()];
    return coinInfo?.name || coinName;
  };

  // Determine side based on direction
  const getSide = (dir: string) => {
    if (dir === "Open Long" || dir === "Close Short") return "Long";
    if (dir === "Open Short" || dir === "Close Long") return "Short";
    return dir;
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
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <Spinner variant="circle" className="text-[rgb(255,59,16)]" size={24} />
          </div>
        )}

        {/* Empty state - no data */}
        {!isLoading && closedPositions.length === 0 && (
          <>{emptyStateComponent}</>
        )}

        {/* Data state - show closed positions */}
        {!isLoading && closedPositions.length > 0 && (
          <>
            {closedPositions.slice().reverse().map((fill, index: number) => {
              const price = parseFloat(fill?.px || "0");
              const size = parseFloat(fill?.sz || "0");
              const fee = parseFloat(fill?.fee || "0");
              const pnl = parseFloat(fill?.closedPnl || "0");
              const isProfit = pnl >= 0;
              const tradeValue = calculateTradeValue(fill.sz, price);
              const side = getSide(fill?.dir || "");

              return (
                <div
                  key={`${fill.tid}-${index}`}
                  className="grid grid-cols-[15%_11%_10%_11%_11%_11%_10%_12%] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
                  style={{
                    height: "48px",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                  }}
                >
                  <div className="text-[#84858C] text-[12px]">{formatTime(fill.time)}</div>

                  <div className="flex items-center gap-[12px]">
                    <Image 
                      src={getCoinIcon(fill.coin)} 
                      alt={fill.coin} 
                      width={20} 
                      height={20} 
                      className="rounded-full" 
                    />
                    <span className="text-white text-[12px]">{getCoinDisplayName(fill.coin)}</span>
                  </div>

                  <div
                    className={`text-[12px] text-right font-medium ${
                      side === "Long" ? "text-[#00AF58]" : "text-[#DC2626]"
                    }`}
                  >
                    {side}
                  </div>

                  <div className="text-white text-[12px] text-right">{formatPrice(price)}</div>

                  <div className="text-white text-[12px] text-right">{Math.abs(size).toFixed(4)}</div>

                  <div className="text-white text-[12px] text-right">{formatPrice(tradeValue)}</div>

                  <div className="text-[#84858C] text-[12px] text-right">{formatPrice(fee)}</div>

                  <div className={`text-[12px] text-right font-medium ${isProfit ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
                    {isProfit ? "+" : ""}
                    {formatPrice(pnl)}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </>
  );
};

export default PositionHistoryTab;