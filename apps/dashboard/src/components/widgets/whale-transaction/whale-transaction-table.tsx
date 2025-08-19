import React, { memo, useState, useEffect } from "react";
import { FullscreenableContainer } from "../shared";
import { WhaleTransaction } from "@/services/queries/charts/types"; 
import { cn, formatPriceSignificant, humanizeNumber } from "@/lib/utils";
import Image from "next/image";

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
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


interface WhaleTransactionTableProps {
  isFullscreen: boolean;
  onAnimationComplete?: () => void;
  transactions: WhaleTransaction[];
}

const WhaleTransactionTable = memo((props: WhaleTransactionTableProps) => {
  const { isFullscreen, onAnimationComplete, transactions } = props;
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    // Set up an interval to update the current time every 30 seconds
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 5000); // 30 seconds

    // Clear the interval when the component unmounts to prevent memory leaks
    return () => clearInterval(intervalId);
  }, []);

  return (
    <FullscreenableContainer
      isFullscreen={isFullscreen}
      onAnimationComplete={onAnimationComplete}
    >
      <div className={cn("scrollbar flex flex-1 flex-col h-full overflow-auto pb-14", isFullscreen && "pt-[50px]")}>
        <table className="w-full table-auto">
          <thead className="sticky top-0 z-2 bg-[#080808]">
            <tr>
              <th className="p-3 text-left text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">User</th>
              <th className="p-3 text-left text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">Token</th>
              <th className="p-3 text-left text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">Time</th>
              <th className="p-3 text-left text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">Activity</th>
              <th className="p-3 text-right text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">Entry Price</th>
              <th className="p-3 text-right text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">Value (USD)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item, index) => {
              const isLong = item.activity.includes('Long');
              const isHighValue = item.value > 5000000;
              
              // Determine the background style based on the conditions
              const rowStyle = isHighValue 
                ? { backgroundColor: isLong ? '#22ab94bf' : '#b71c1c' } 
                : {};

              const rowClassName = !isHighValue 
                ? cn({
                    'bg-gradient-to-l from-green-500/20 to-transparent': isLong,
                    'bg-gradient-to-l from-red-500/20 to-transparent': !isLong,
                  })
                : '';

              return (
                <tr 
                  key={`${item.time}-${index}`}
                  className={rowClassName}
                  style={rowStyle}
                >
                  <td className="border-y border-[#121212] py-2 pl-3 whitespace-nowrap text-white text-[13px]">
                    {`${item.user.slice(0, 6)}...${item.user.slice(-2)}`}
                  </td>
                  <td className="border-y border-[#121212] py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {/* Placeholder for token icon, you might need to fetch this separately */}
                      <p className="text-[13px] leading-[18px] font-semibold text-white">{item.token}</p>
                    </div>
                  </td>
                  <td className="border-y border-[#121212] px-3 py-2 text-left text-[13px] leading-[1] whitespace-nowrap text-white">
                    {formatTimeAgo(item.time)}
                  </td>
                  <td className="border-y border-[#121212] px-3 py-2 text-left text-[13px] leading-[1] whitespace-nowrap text-white">
                    {item.activity}
                  </td>
                  <td className="border-y border-[#121212] px-3 py-2 text-right text-[13px] leading-[1] whitespace-nowrap text-white">
                    ${formatPriceSignificant(item.entryPrice)}
                  </td>
                  <td className="border-y border-[#121212] px-3 py-2 text-right text-[13px] leading-[1] whitespace-nowrap text-white">
                    ${formatWhaleValue(item.value)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </FullscreenableContainer>
  );
});

WhaleTransactionTable.displayName = "WhaleTransactionTable";

export default WhaleTransactionTable;
