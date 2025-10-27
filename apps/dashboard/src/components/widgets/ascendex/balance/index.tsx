"use client";
import React from "react";
import BalanceAccountHeader from "./balance-account-header";
import BalanceChart from "./balance-chart";
import DetailedBalance from "./detailed-balance";

export default function Balance() {
  return (
    <div className="flex h-full w-full flex-1 overflow-y-auto overflow-x-hidden gap-3 px-2 pb-2 font-inter no-scrollbar">
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex-shrink-0">
          <BalanceAccountHeader />
        </div>
        <BalanceChart />
        <div className="flex-shrink-0">
          <DetailedBalance />
        </div>
      </div>
    </div>
  );
}
