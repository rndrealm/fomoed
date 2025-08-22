import React, { memo, useState, useEffect, useMemo } from "react";
import { FullscreenableContainer } from "../shared";
import {
  WhaleTransaction,
  CoinDataInterface,
} from "@/services/queries/charts/types"; // Adjust import path
import { cn, formatPriceSignificant, humanizeNumber } from "@/lib/utils";
import Image from "next/image";

// --- Custom Date Formatting Function ---
const formatTimeAgo = (timestamp: number): string => {
  const now = new Date();
  const secondsPast = (now.getTime() - timestamp) / 1000;

  if (secondsPast < 60) {
    return `${Math.round(secondsPast)}s ago`;
  }
  if (secondsPast < 3600) {
    return `${Math.round(secondsPast / 60)}m ago`;
  }
  if (secondsPast <= 86400) {
    return `${Math.round(secondsPast / 3600)}h ago`;
  }
  const days = Math.round(secondsPast / 86400);
  return `${days}d ago`;
};

// --- Custom Value Formatting Function ---
const formatWhaleValue = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface WhaleTransactionTableProps {
  isFullscreen: boolean;
  onAnimationComplete?: () => void;
  transactions: WhaleTransaction[];
  coinData: CoinDataInterface[];
}

const WhaleTransactionTable = memo((props: WhaleTransactionTableProps) => {
  const { isFullscreen, onAnimationComplete, transactions, coinData } = props;
  const [currentTime, setCurrentTime] = useState(Date.now());

  const iconMap = useMemo(() => {
    const map = new Map<string, string>();
    coinData.forEach((coin) => {
      map.set(coin.symbol, coin.icon);
    });
    return map;
  }, [coinData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <FullscreenableContainer
      isFullscreen={isFullscreen}
      onAnimationComplete={onAnimationComplete}
    >
      <div
        className={cn(
          "scrollbar flex flex-1 flex-col h-full overflow-auto pb-14",
          isFullscreen && "pt-[50px]",
        )}
      >
        <table className="w-full table-auto">
          <thead className="sticky top-0 z-2 bg-[#080808]">
            <tr>
              <th className="p-3 text-left text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">
                User
              </th>
              <th className="p-3 text-left text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">
                Token
              </th>
              <th className="p-3 text-left text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">
                Time
              </th>
              <th className="p-3 text-left text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">
                Activity
              </th>
              <th className="p-3 text-right text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">
                Entry Price
              </th>
              <th className="p-3 text-right text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">
                Value (USD)
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item, index) => {
              const isLong = item.activity.includes("Long");
              const isHighValue = item.value > 5000000;
              const iconUrl = iconMap.get(item.token);

              const rowStyle = isHighValue
                ? { backgroundColor: isLong ? "#00FF88" : "#FF3366" }
                : {
                    background: isLong
                      ? "linear-gradient(90deg, #0C0C0C 6.18%, #171717 14.26%, #272B29 61.91%, rgba(72, 84, 79, 0.6) 86.62%, #7DC4A4 108.97%)"

                      : "linear-gradient(90deg, #0C0C0C 6.18%, #171717 14.26%, rgba(59, 34, 29, 0.887805) 68.09%, rgba(152, 62, 43, 0.6) 86.62%, #FF8970 108.97%)",

                  };

              return (
                <tr key={`${item.time}-${index}`} style={rowStyle}>
                  <td className="border-y border-transparent py-2 pl-3 whitespace-nowrap text-white text-[13px]">
                    {`${item.user.slice(0, 6)}...${item.user.slice(-2)}`}
                  </td>
                  <td className="border-y border-transparent py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {iconUrl ? (
                        <Image
                          src={iconUrl}
                          alt={`${item.token} logo`}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="overflow-hidden h-[24px] w-[24px] rounded-full bg-neutral-700"></div>
                      )}
                      <p className="text-[13px] leading-[18px] font-semibold text-white">
                        {item.token}
                      </p>
                    </div>
                  </td>
                  <td className="border-y border-transparent px-3 py-2 text-left text-[13px] leading-[1] whitespace-nowrap text-white">
                    {new Date(item.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="border-y border-transparent px-3 py-2 text-left text-[13px] leading-[1] whitespace-nowrap text-white">
                    {item.activity}
                  </td>
                  <td className="border-y border-transparent px-3 py-2 text-right text-[13px] leading-[1] whitespace-nowrap text-white">
                    ${formatPriceSignificant(item.entryPrice)}
                  </td>
                  <td className="border-y border-transparent px-3 py-2 text-right text-[13px] leading-[1] whitespace-nowrap text-white">
                    ${formatWhaleValue(item.value)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </FullscreenableContainer>
  );
});

WhaleTransactionTable.displayName = "WhaleTransactionTable";

export default WhaleTransactionTable;
