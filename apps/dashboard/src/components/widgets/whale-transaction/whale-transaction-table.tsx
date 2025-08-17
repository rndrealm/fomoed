import React, { memo, useState, useEffect } from "react";
import { FullscreenableContainer } from "../shared";
import { WhaleTransaction } from "@/services/queries/charts/types"; // Adjust import path
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


interface WhaleTransactionTableProps {
  isFullscreen: boolean;
  onAnimationComplete?: () => void;
  transactions: WhaleTransaction[];
}

const WhaleTransactionTable = memo((props: WhaleTransactionTableProps) => {
  const { isFullscreen, onAnimationComplete, transactions } = props;
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 5000); 

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
              <th className="p-3 text-left text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">Direction</th>
              <th className="p-3 text-right text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">Entry Price</th>
              <th className="p-3 text-right text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">Value (USD)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item, index) => (
              <tr key={`${item.time}-${index}`}>
                <td className="border-y border-[#121212] py-2 whitespace-nowrap text-white text-[13px]">
                  {`${item.user.slice(0, 4)}...${item.user.slice(-2)}`}
                </td>
                <td className="border-y border-[#121212] py-2 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] leading-[18px] font-semibold text-white">{item.token}</p>
                  </div>
                </td>
                <td className="border-y border-[#121212] px-3 py-2 text-left text-[13px] leading-[1] whitespace-nowrap text-white">
                  {formatTimeAgo(item.time)}
                </td>
                <td className={cn(
                  "border-y border-[#121212] px-3 py-2 text-left text-[13px] leading-[1] whitespace-nowrap",
                  item.direction === 'Long' ? 'text-green-500' : 'text-red-500'
                )}>
                  {item.direction}
                </td>
                <td className="border-y border-[#121212] px-3 py-2 text-right text-[13px] leading-[1] whitespace-nowrap text-white">
                  ${formatPriceSignificant(item.entryPrice)}
                </td>
                <td className="border-y border-[#121212] px-3 py-2 text-right text-[13px] leading-[1] whitespace-nowrap text-white">
                  ${humanizeNumber(item.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FullscreenableContainer>
  );
});

WhaleTransactionTable.displayName = "WhaleTransactionTable";

export default WhaleTransactionTable;
