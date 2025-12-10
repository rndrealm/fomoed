"use client";
import React from "react";
import { ArrowLeftRight } from "lucide-react";
import { useHyperliquidClearinghouseState } from "@/services/queries/hyperliquid-dex";

interface BalanceAccountHeaderProps {
  userAddress: string;
  accountName?: string;
}

export default function BalanceAccountHeader({ userAddress, accountName = "Account 1" }: BalanceAccountHeaderProps) {
  const { data: clearinghouse, isLoading } = useHyperliquidClearinghouseState(userAddress, !!userAddress);

  const formatBalance = (value: string | undefined) => {
    if (!value) return "$0.00";
    const numValue = parseFloat(value);
    return `$${numValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const accountValue = clearinghouse?.marginSummary?.accountValue;
  const balance = formatBalance(accountValue);

  return (
    <div
      className="flex items-center justify-between w-full bg-[#121317] rounded-[10px] flex-shrink-0"
      style={{ height: "72px", padding: "0 12px" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center bg-[#2A2B2E] rounded-[6px] text-[#9CA3AF] font-semibold text-[12px]"
          style={{ width: "29px", height: "24px" }}
        >
          A1
        </div>
        <div className="flex flex-col">
          <span className="text-white font-semibold text-sm leading-tight">{accountName}</span>
          <span className="text-[#9CA3AF] text-sm leading-tight">{isLoading ? "Loading..." : balance}</span>
        </div>
      </div>

      <div className="flex hidden items-center gap-3">
        <button
          className="flex items-center justify-center bg-[rgba(118,55,186,0.2)] text-[#7637BA] font-semibold text-[12px] px-4 rounded-[8px] hover:bg-[rgba(118,55,186,0.3)] transition-colors"
          style={{ height: "32px" }}
        >
          Deposit
        </button>

        <div className="flex items-center bg-[#1C1D21] rounded-[8px] overflow-hidden">
          <button className="flex items-center justify-center bg-[#1C1D21] text-[#9CA3AF] rounded-[8px] h-[32px] px-4 gap-2 hover:bg-[#2A2B2E] hover:text-white transition-colors">
            <span className="text-[12px] font-semibold">Perp</span>
            <ArrowLeftRight className="h-4 w-4" />
            <span className="text-[12px] font-semibold">Spot</span>
          </button>
        </div>
      </div>
    </div>
  );
}
