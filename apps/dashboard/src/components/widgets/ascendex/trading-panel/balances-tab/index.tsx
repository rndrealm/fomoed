"use client";
import React from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";

interface BalanceData {
  coin: string;
  coinIcon: string;
  contract: string;
  totalBalance: number;
  usdcValue: number;
  pnl: number;
  pnlPercentage: number;
  contractType: string;
}

// Dummy data for initial display
const DUMMY_BALANCES: BalanceData[] = [];

interface BalancesTabProps {
  hideSmallBalances: boolean;
}

export default function BalancesTab({ hideSmallBalances }: BalancesTabProps) {
  const filteredBalances = hideSmallBalances
    ? DUMMY_BALANCES.filter((balance) => balance.usdcValue > 1)
    : DUMMY_BALANCES;

  return (
    <div className="flex flex-col h-full">
      {/* Table Header */}
      <div
        className="grid items-center border-b border-[#0C0C0C] px-3"
        style={{
          gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
          height: "32px",
        }}
      >
        <div className="text-[#84858C] text-[12px]">Coin</div>
        <div className="text-[#84858C] text-[12px]">Contract</div>
        <div className="text-[#84858C] text-[12px]">Total Balance</div>
        <div className="text-[#84858C] text-[12px]">USDC Value</div>
        <div className="text-[#84858C] text-[12px]">PNL (ROE%)</div>
        <div className="text-[#84858C] text-[12px]">Contract</div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-auto">
        {filteredBalances.length === 0 ? (
          <div className="flex flex-col min-h-[375px] h-full items-center justify-center bg-[#191B20] rounded-[6px] my-1">
            <Image src={dashboard.noDeposits} alt="No balances" width={168} height={168} className="mb-4" />
            <p className="text-white text-[20px] font-semibold">No balances to display</p>
          </div>
        ) : (
          filteredBalances.map((balance, index) => (
            <div
              key={index}
              className="grid items-center border-b border-[#0C0C0C] px-3 hover:bg-[#1C1D21] transition-colors"
              style={{
                gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                height: "48px",
              }}
            >
              {/* Coin */}
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-6">
                  <Image
                    src={balance.coinIcon}
                    alt={balance.coin}
                    fill
                    className="rounded-full"
                  />
                </div>
                <span className="text-white text-[12px] font-medium">{balance.coin}</span>
              </div>

              {/* Contract */}
              <div className="text-white text-[12px]">{balance.contract}</div>

              {/* Total Balance */}
              <div className="text-white text-[12px]">{balance.totalBalance.toFixed(4)}</div>

              {/* USDC Value */}
              <div className="text-white text-[12px]">${balance.usdcValue.toFixed(2)}</div>

              {/* PNL (ROE%) */}
              <div className="flex flex-col">
                <span
                  className={`text-[12px] ${
                    balance.pnl >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  ${balance.pnl >= 0 ? "+" : ""}
                  {balance.pnl.toFixed(2)}
                </span>
                <span
                  className={`text-[10px] ${
                    balance.pnlPercentage >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  ({balance.pnlPercentage >= 0 ? "+" : ""}
                  {balance.pnlPercentage.toFixed(2)}%)
                </span>
              </div>

              {/* Contract Type */}
              <div className="text-[#84858C] text-[12px]">{balance.contractType}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
