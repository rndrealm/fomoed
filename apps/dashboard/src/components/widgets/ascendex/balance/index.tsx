"use client";
import React from "react";
import BalanceAccountHeader from "./balance-account-header";
import BalanceChart from "./balance-chart";
import DetailedBalance from "./detailed-balance";

export default function Balance() {
  const userAddress = "0x02eC6F09CF972caEBd171314AE1C5c1B30919a57";
  return (
    <div className="flex h-full w-full flex-1 overflow-y-auto overflow-x-hidden gap-3 px-2 pb-2 font-inter no-scrollbar">
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex-shrink-0">
          <BalanceAccountHeader userAddress={userAddress} accountName="My Account" />
        </div>
        <BalanceChart userAddress={userAddress} />
        <div className="flex-shrink-0">
          <DetailedBalance userAddress={userAddress} />
        </div>
      </div>
    </div>
  );
}
