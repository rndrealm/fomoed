"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  useHyperliquidSpotState,
  useHyperliquidClearinghouseState,
  useHyperliquidOpenOrders,
  useHyperliquidAllMids,
} from "@/services/queries/hyperliquid-dex";
import { useFetchCoinStatsToken } from "@/services/queries/charts";
import dashboard from "@/lib/assets/dashboard";

interface BalancesTabProps {
  userAddress: string;
}

interface AssetBalance {
  symbol: string;
  name: string;
  icon: string;
  totalBalance: number;
  totalBalanceUsd: number;
  availableBalance: number;
  availableBalanceUsd: number;
  openOrders: number;
}

const BalancesTab = ({ userAddress }: BalancesTabProps) => {
  const [activeTab, setActiveTab] = useState<"assets" | "statements">("assets");

  const { data: spotState } = useHyperliquidSpotState(userAddress, !!userAddress);
  const { data: clearinghouse } = useHyperliquidClearinghouseState(userAddress, !!userAddress);
  const { data: openOrders } = useHyperliquidOpenOrders(userAddress, !!userAddress);
  const { data: allMids } = useHyperliquidAllMids();
  const { data: coinStatsData } = useFetchCoinStatsToken();

  const coinInfoMap = useMemo(() => {
    if (!coinStatsData) return {};
    const map: Record<string, { name: string; icon: string }> = {};
    coinStatsData.forEach((coin) => {
      map[coin.symbol.toUpperCase()] = {
        name: coin.name,
        icon: coin.icon,
      };
    });
    return map;
  }, [coinStatsData]);

  const allCoinSymbols = useMemo(() => {
    const symbols = new Set<string>();

    if (spotState?.balances) {
      spotState.balances.forEach((balance) => {
        const total = parseFloat(balance.total);
        if (total > 0 || parseFloat(balance.hold) > 0) {
          symbols.add(balance.coin);
        }
      });
    }

    if (clearinghouse?.marginSummary?.totalRawUsd) {
      const perpBalance = parseFloat(clearinghouse.marginSummary.totalRawUsd);
      if (perpBalance > 0) {
        symbols.add("USDC");
      }
    }

    console.log("Spot coin symbols found:", Array.from(symbols));
    return Array.from(symbols);
  }, [spotState, clearinghouse]);

  const assetBalances = useMemo(() => {
    console.log("Processing spot balances...");
    console.log("spotState:", spotState);

    const balances: Record<string, AssetBalance> = {};

    if (spotState?.balances) {
      spotState.balances.forEach((balance) => {
        const coinSymbol = balance.coin;
        const total = parseFloat(balance.total);
        const hold = parseFloat(balance.hold);
        const available = total - hold;
        const price = allMids?.[coinSymbol] ? parseFloat(allMids[coinSymbol]) : 1;

        if (total > 0 || hold > 0) {
          // console.log(`Spot balance for ${coinSymbol}:`, { total, hold, available, price });

          const coinInfo = coinInfoMap[coinSymbol] || {
            name: coinSymbol,
            icon: `https://static.coinstats.app/coins/1650455771843.png`,
          };

          balances[coinSymbol] = {
            symbol: coinSymbol,
            name: coinInfo.name,
            icon: coinInfo.icon,
            totalBalance: total,
            totalBalanceUsd: total * price,
            availableBalance: available,
            availableBalanceUsd: available * price,
            openOrders: 0,
          };
        }
      });
    }

    if (openOrders) {
      openOrders.forEach((order) => {
        const coinSymbol = order.coin;
        if (balances[coinSymbol]) {
          balances[coinSymbol].openOrders += 1;
        }
      });
    }

    const result = Object.values(balances).sort((a, b) => b.totalBalanceUsd - a.totalBalanceUsd);
    // console.log("Final spot balances:", result);

    return result;
  }, [spotState, openOrders, allMids, coinInfoMap]);

  const formatNumber = (num: number) => {
    if (num === 0) return "0";
    if (num < 0.00000001) return num.toExponential(2);
    return num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 8 });
  };

  const formatUsd = (num: number) => {
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (assetBalances.length === 0) {
    return (
      <div className="w-full h-full flex flex-col">
        <p className="text-white text-[22px] px-3 py-2">Balances</p>
        <div className="flex items-center px-3 pb-3">
          <div className="flex bg-[#222329] p-[2px] rounded-[6px]">
            <button
              onClick={() => setActiveTab("assets")}
              className={`text-[12px] px-3 h-[24px] transition rounded-[5px] ${
                activeTab === "assets" ? "bg-[#2B2C32] text-white" : "text-[#84858C]"
              }`}
            >
              Assets
            </button>
            <button
              onClick={() => setActiveTab("statements")}
              className={`text-[12px] px-3 h-[24px] transition rounded-[5px] ${
                activeTab === "statements" ? "bg-[#2B2C32] text-white" : "text-[#84858C]"
              }`}
            >
              Statements
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden px-3">
          {/* Header */}
          <div
            className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center justify-between"
            style={{
              width: "fill (1,131px)",
              height: "32px",
              paddingTop: "8px",
              paddingBottom: "8px",
              paddingLeft: "12px",
              paddingRight: "12px",
            }}
          >
            <div className="text-[#84858C] text-[12px] font-medium">Asset</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Total Balance</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Available Balance</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Open Orders</div>
            <div className="w-[240px]"></div>
          </div>

          {/* Empty State */}
          <div className="flex flex-col h-full items-center justify-center bg-[#191B20] rounded-[20px] my-1">
            <Image src={dashboard.noDeposits} alt="No assets" width={168} height={168} className="mb-4" />
            <p className="text-white text-[20px] font-semibold">No Spot Assets</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-white text-[22px] px-3 py-2">Balances</p>

      {/* Sub-tabs */}
      <div className="flex items-center px-3 pb-3">
        <div className="flex bg-[#222329] p-[2px] rounded-[6px]">
          <button
            onClick={() => setActiveTab("assets")}
            className={`text-[12px] px-3 h-[24px] transition rounded-[5px]
        ${activeTab === "assets" ? "bg-[#2B2C32] text-white" : "text-[#84858C]"}
      `}
          >
            Assets
          </button>
          <button
            onClick={() => setActiveTab("statements")}
            className={`text-[12px] px-3 h-[24px] transition rounded-[5px]
        ${activeTab === "statements" ? "bg-[#2B2C32] text-white" : "text-[#84858C]"}
      `}
          >
            Statements
          </button>
        </div>
      </div>

      {/* Table  */}
      <div className="flex-1 flex flex-col overflow-hidden px-3">
        {/* Header */}
        <div
          className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center justify-between"
          style={{
            width: "fill (1,131px)",
            height: "32px",
            paddingTop: "8px",
            paddingBottom: "8px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          <div className="text-[#84858C] text-[12px] font-medium">Asset</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Total Balance</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Available Balance</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Open Orders</div>
          <div className="w-[240px]"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto no-scrollbar">
          {assetBalances.map((asset) => (
            <div
              key={asset.symbol}
              className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 hover:bg-[#1C1D21] transition-colors items-center justify-between"
              style={{
                height: "64px",
                paddingTop: "16px",
                paddingBottom: "16px",
                paddingLeft: "12px",
                paddingRight: "12px",
              }}
            >
              {/* Asset */}
              <div className="flex items-center gap-[12px] h-[32px]">
                <Image
                  src={asset.icon}
                  alt={asset.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = "https://static.coinstats.app/coins/1650455771843.png";
                  }}
                />
                <div className="flex flex-col justify-center">
                  <span className="text-white text-[12px] font-medium leading-tight">{asset.name}</span>
                  <span className="text-[#84858C] text-[12px] leading-tight">{asset.symbol}</span>
                </div>
              </div>

              {/* Total Balance */}
              <div className="flex flex-col items-end justify-center h-[32px]">
                <span className="text-white text-[12px] font-medium leading-tight">
                  {formatNumber(asset.totalBalance)}
                </span>
                <span className="text-[#84858C] text-[12px] leading-tight">{formatUsd(asset.totalBalanceUsd)}</span>
              </div>

              {/* Available Balance */}
              <div className="flex flex-col items-end justify-center h-[32px]">
                <span className="text-white text-[12px] font-medium leading-tight">
                  {formatNumber(asset.availableBalance)}
                </span>
                <span className="text-[#84858C] text-[12px] leading-tight">{formatUsd(asset.availableBalanceUsd)}</span>
              </div>

              {/* Open Orders */}
              <div className="flex items-center justify-end h-[32px]">
                <span className="text-white text-[12px] font-medium">{asset.openOrders}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 justify-end w-[240px] h-[32px]">
                <button className="px-4 h-[32px] rounded-[8px] bg-[rgba(118,55,186,0.2)] text-[#7637BA] text-[12px] font-medium hover:bg-[rgba(118,55,186,0.3)] transition-colors">
                  Deposit
                </button>
                <button className="px-4 h-[32px] rounded-[8px] bg-[#222329] text-[#E7E7E7] text-[12px] font-medium hover:bg-[#2B2C32] transition-colors">
                  Withdraw
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BalancesTab;
