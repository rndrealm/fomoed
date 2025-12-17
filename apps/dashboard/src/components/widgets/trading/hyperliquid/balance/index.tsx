"use client";
import React from "react";
import BalanceChart from "./balance-chart";
import DetailedBalance from "./detailed-balance";
import { useAccount } from "wagmi";

export default function Balance() {
  const { address } = useAccount();
  const userAddress = address || "";

  return (
    <div className="flex h-full w-full flex-1 overflow-y-auto overflow-x-hidden gap-3 px-2 pb-2 font-inter no-scrollbar">
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex-shrink-0">
          <BalanceChart userAddress={userAddress} />
        </div>
        <div className="flex-shrink-0">
          <DetailedBalance userAddress={userAddress} />
        </div>
      </div>
    </div>
  );
}
