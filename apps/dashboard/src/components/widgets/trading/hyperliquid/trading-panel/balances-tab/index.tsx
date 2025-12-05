"use client";
import React, { Fragment, useMemo } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useClearingHouseState } from "../../../chart/trading-view/hyperliquid/use-clearinghouse-state";
import { useSpotState } from "../../../chart/trading-view/hyperliquid/use-spot-state";
import { useHyperliquidSpotPrices } from "@/services/queries/hyperliquid-dex";

interface BalanceData {
  coin: string;
  source: "Perp" | "Spot";
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

const hideSmallBalances = false;
const userAddress = "0x02eC6F09CF972caEBd171314AE1C5c1B30919a57";

export default function BalancesTab() {
  const { clearingHouse } = useClearingHouseState(userAddress);
  const { spotState } = useSpotState(userAddress);
  const { spotPrices } = useHyperliquidSpotPrices(true);

  const isLoading = !clearingHouse || !spotState;

  const totalBalance = clearingHouse?.clearinghouseState?.marginSummary?.accountValue
    ? Number(clearingHouse.clearinghouseState.marginSummary.accountValue)
    : 0;

  const balances: BalanceData[] = useMemo(() => {
    if (!clearingHouse?.clearinghouseState || !spotState?.spotState) {
      return [];
    }

    const balanceList: BalanceData[] = [];
    const withdrawable = clearingHouse.clearinghouseState.withdrawable
      ? Number(clearingHouse.clearinghouseState.withdrawable)
      : 0;

    if (clearingHouse.clearinghouseState.crossMarginSummary) {
      const accountValue = Number(clearingHouse.clearinghouseState.crossMarginSummary.accountValue || "0");

      balanceList.push({
        coin: "USDC",
        totalBalance: accountValue,
        availableBalance: withdrawable,
        usdcValue: accountValue,
        pnl: 0,
        roe: 0,
        source: "Perp",
      });
    }

    if (spotState.spotState.balances) {
      spotState.spotState.balances.forEach((balance) => {
        const total = parseFloat(balance.total);
        const hold = parseFloat(balance.hold);
        const available = total - hold;
        const entryNtl = parseFloat(balance.entryNtl);

        if (hideSmallBalances && total <= 0.01) {
          return;
        }

        let currentPrice = 0;
        let currentValue = 0;

        if (balance.coin === "USDC") {
          currentPrice = 1;
          currentValue = total;
        } else {
          currentPrice = spotPrices?.[balance.token] || 0;
          currentValue = total * currentPrice;
        }

        let pnl = 0;
        let roe = 0;
        if (entryNtl !== 0 && total !== 0 && balance.coin !== "USDC") {
          pnl = currentValue - entryNtl;
          roe = entryNtl !== 0 ? (pnl / Math.abs(entryNtl)) * 100 : 0;
        }

        balanceList.push({
          coin: balance.coin,
          totalBalance: total,
          availableBalance: available,
          usdcValue: currentValue,
          pnl,
          roe,
          source: "Spot",
        });
      });
    }

    return balanceList;
  }, [clearingHouse, spotState]);

  const filteredBalances = balances.filter((balance) => balance.usdcValue > 1);
  // const filteredBalances = hideSmallBalances ? balances.filter((balance) => balance.usdcValue > 1) : balances;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="text-[#84858C] text-[14px]">Loading balances...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="px-3 py-2 border-b border-[#0C0C0C]">
        <div className="text-[#84858C] text-[12px]">Your Balances</div>
        <div className="text-white text-[16px] font-medium">
          {isLoading ? (
            <span className="text-[#84858C]">Loading...</span>
          ) : (
            `$ ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col h-full">
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
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "15%" }}>
                    Source
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
                  {/* <th className="text-left text-[#84858C] text-[12px] font-normal px-3 py-2" style={{ width: "20%" }}>
                    PNL (ROE %)
                  </th> */}
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

                    <td className="px-3">
                      <span className="text-white text-[12px]">{balance.source}</span>
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
                    {/* <td className="px-3">
                      {balance.coin !== "USDC" && (balance.pnl !== 0 || balance.roe !== 0) && (
                        <div className="flex flex-col">
                          <span
                            className={`text-[12px] font-medium ${balance.pnl >= 0 ? "text-green-500" : "text-red-500"}`}
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
                    </td> */}
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
    </div>
  );
}
