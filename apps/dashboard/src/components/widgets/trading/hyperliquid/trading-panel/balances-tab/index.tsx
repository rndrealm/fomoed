"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useHyperliquidClearinghouseState } from "@/services/queries/hyperliquid-dex";

interface BalanceData {
  coin: string;
  // coinIcon: string;
  totalBalance: number;
  availableBalance: number;
  usdcValue: number;
  pnl: number;
  roe: number;
}

interface BalancesTabProps {
  hideSmallBalances: boolean;
  userAddress: string;
}

export default function BalancesTab({ hideSmallBalances, userAddress }: BalancesTabProps) {
  const { data: clearinghouseState, isLoading } = useHyperliquidClearinghouseState(userAddress, !!userAddress);

  const balances: BalanceData[] = useMemo(() => {
    const balanceList: BalanceData[] = [];

    const withdrawable = clearinghouseState?.withdrawable 
      ? parseFloat(clearinghouseState.withdrawable) 
      : 0;

    if (clearinghouseState?.crossMarginSummary) {
      const accountValue = parseFloat(clearinghouseState.crossMarginSummary.accountValue || "0");
      const totalRawUsd = parseFloat(clearinghouseState.crossMarginSummary.totalRawUsd || "0");
      const totalMarginUsed = parseFloat(clearinghouseState.crossMarginSummary.totalMarginUsed || "0");
      
      balanceList.push({
        coin: "USDC",
        // coinIcon: "/coins/usdc.png",
        totalBalance: accountValue,
        availableBalance: withdrawable,
        usdcValue: accountValue,
        pnl: 0, 
        roe: 0,
      });
    }
    
    return balanceList;
  }, [clearinghouseState]);

  const filteredBalances = hideSmallBalances 
    ? balances.filter((balance) => balance.usdcValue > 1) 
    : balances;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="text-[#84858C] text-[14px]">Loading balances...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filteredBalances.length === 0 ? (
          <div className="flex flex-col min-h-[300px] h-full items-center justify-center bg-[#191B20] rounded-[6px] my-1">
            <Image src={dashboard.noDeposits} alt="No balances" width={168} height={168} className="mb-4" />
            <p className="text-white text-[20px] font-semibold">No balances to display</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#0C0C0C]">
                <th className="text-left text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "20%" }}>
                  Coin
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "20%" }}>
                  Total Balance
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "20%" }}>
                  Available Balance
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "20%" }}>
                  USDC Value
                </th>
                <th className="text-left text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "20%" }}>
                  PNL (ROE %)
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBalances.map((balance, index) => (
                <tr
                  key={`${balance.coin}-${index}`}
                  className="border-b border-[#0C0C0C] hover:bg-[#1C1D21] transition-colors"
                  style={{ height: "56px" }}
                >
                  {/* Coin */}
                  <td className="px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-[14px] font-medium">{balance.coin}</span>
                    </div>
                  </td>

                  {/* Total Balance */}
                  <td className="px-3">
                    <span className="text-white text-[12px]">
                      {balance.totalBalance.toFixed(2)} {balance.coin}
                    </span>
                  </td>

                  {/* Available Balance */}
                  <td className="px-3">
                    <span className="text-white text-[12px]">
                      {balance.availableBalance.toFixed(2)} {balance.coin}
                    </span>
                  </td>

                  {/* USDC Value */}
                  <td className="px-3">
                    <span className="text-white text-[12px]">${balance.usdcValue.toFixed(2)}</span>
                  </td>

                  {/* PNL (ROE %) */}
                  <td className="px-3">
                    {balance.coin !== "USDC" && (
                      <div className="flex flex-col">
                        <span
                          className={`text-[12px] font-medium ${
                            balance.pnl >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          ${balance.pnl >= 0 ? "+" : ""}
                          {balance.pnl.toFixed(2)}
                        </span>
                        <span className={`text-[10px] ${balance.roe >= 0 ? "text-green-500" : "text-red-500"}`}>
                          ({balance.roe >= 0 ? "+" : ""}
                          {balance.roe.toFixed(2)}%)
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Footer */}
      {filteredBalances.length > 0 && (
        <div className="border-t border-[#0C0C0C] px-3 py-2 bg-[#0E0E0E]">
          <div className="flex justify-between items-center">
            <span className="text-[#84858C] text-[12px]">Total Assets: {filteredBalances.length}</span>
            <div className="flex gap-4">
              <div>
                <span className="text-[#84858C] text-[12px]">Total Value: </span>
                <span className="text-white text-[12px] font-medium">
                  ${filteredBalances.reduce((sum, b) => sum + b.usdcValue, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}