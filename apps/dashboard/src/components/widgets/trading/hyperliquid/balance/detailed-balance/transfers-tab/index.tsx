"use client";
import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useHyperliquidUserNonFundingLedgerUpdates } from "@/services/queries/hyperliquid-dex";
import { useFetchCoinStatsToken } from "@/services/queries/charts";

interface TransfersTabProps {
  userAddress: string;
}

interface TransferData {
  asset: string;
  assetName: string;
  assetIcon: string;
  quantity: string;
  chain: string;
  destinationAddress: string;
  initiated: number;
  transactionId: string;
  status: string;
  type: "deposit" | "withdraw";
}

const TransfersTab = ({ userAddress }: TransfersTabProps) => {
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">("deposits");

  const { data: coinStatsData } = useFetchCoinStatsToken();
  const { mutate: fetchLedgerUpdates, data: ledgerUpdates } = useHyperliquidUserNonFundingLedgerUpdates();

  // Fetch last 30 days of transfers on mount
  useEffect(() => {
    if (userAddress) {
      const endTime = Date.now();
      const startTime = endTime - 300 * 24 * 60 * 60 * 1000; 
      fetchLedgerUpdates({ userAddress, startTime, endTime });
    }
  }, [userAddress, fetchLedgerUpdates]);

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

  const transfers: TransferData[] = useMemo(() => {
    if (!ledgerUpdates) return [];

    return ledgerUpdates
      .map((update: any): TransferData | null => {
        const delta = update.delta;
        const type = delta.type;

        if (type !== "deposit" && type !== "withdraw") {
          return null;
        }

        const asset = (() => {
          if (typeof delta.token === "number") {
            return delta.token === 0 ? "USDC" : `Token-${delta.token}`;
          }

          if (delta.coin) return delta.coin.toUpperCase();
          if (delta.asset) return delta.asset.toUpperCase();
          if (delta.symbol) return delta.symbol.toUpperCase();
          if (delta.ticker) return delta.ticker.toUpperCase();

          if (delta.usdc) return "USDC";

          return "UNKNOWN";
        })();

        const coinInfo = coinInfoMap[asset] || {
          name: asset,
          icon: "https://static.coinstats.app/coins/default.png",
        };

        const quantity = delta.usdc || delta.amount || "0";

        const chain = "Hyperliquid";

        const destinationAddress = delta.destination || delta.user || userAddress;

        return {
          asset,
          assetName: coinInfo.name,
          assetIcon: coinInfo.icon,
          quantity,
          chain,
          destinationAddress,
          initiated: update.time,
          transactionId: update.hash,
          status: "Completed", 
          type: type === "deposit" ? "deposit" : "withdraw",
        };
      })
      .filter((t: TransferData | null): t is TransferData => t !== null);
  }, [ledgerUpdates, coinInfoMap, userAddress]);

  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      if (activeTab === "deposits") return t.type === "deposit";
      return t.type === "withdraw";
    });
  }, [transfers, activeTab]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTxId = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const hasData = filteredTransfers.length > 0;

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-white text-[22px] px-3 py-2">Transfers</p>

      {/* Sub-tabs */}
      <div className="flex items-center px-3 pb-3">
        <div className="flex bg-[#222329] p-[2px] rounded-[6px]">
          <button
            onClick={() => setActiveTab("deposits")}
            className={`text-[12px] px-3 h-[24px] transition rounded-[4px] ${
              activeTab === "deposits" ? "bg-[#2B2C32] text-white" : "text-[#84858C]"
            }`}
          >
            Deposits
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`text-[12px] px-3 h-[24px] transition rounded-[4px] ${
              activeTab === "withdrawals" ? "bg-[#2B2C32] text-white" : "text-[#84858C]"
            }`}
          >
            Withdrawals
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 flex flex-col overflow-hidden px-3">
        {/* Header */}
        <div
          className="grid grid-cols-[1fr_1fr_1fr_2fr_1.5fr_1.5fr_1fr] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
          style={{
            height: "32px",
            paddingTop: "8px",
            paddingBottom: "8px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          <div className="text-[#84858C] text-[12px] font-medium">Asset</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Quantity</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Chain</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Destination Address</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Initiated</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Transaction ID</div>
          <div className="text-[#84858C] text-[12px] font-medium text-right">Status</div>
        </div>

        {/* Content */}
        {hasData ? (
          <div className="flex-1 overflow-auto no-scrollbar">
            {filteredTransfers.map((transfer: TransferData, index: number) => (
              <div
                key={`${transfer.transactionId}-${index}`}
                className="grid grid-cols-[1fr_1fr_1fr_2fr_1.5fr_1.5fr_1fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
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
                    src={transfer.assetIcon}
                    alt={transfer.assetName}
                    width={32}
                    height={32}
                    className="rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = "https://static.coinstats.app/coins/default.png";
                    }}
                  />
                  <div className="flex flex-col justify-center">
                    <span className="text-white text-[12px] font-medium leading-tight">{transfer.assetName}</span>
                    <span className="text-[#84858C] text-[12px] leading-tight">{transfer.asset}</span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-end h-[32px]">
                  <span className="text-white text-[12px] font-medium">
                    {parseFloat(transfer.quantity).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </span>
                </div>

                {/* Chain */}
                <div className="flex items-center justify-end h-[32px]">
                  <span className="text-white text-[12px]">{transfer.chain}</span>
                </div>

                {/* Destination Address */}
                <div className="flex items-center justify-end h-[32px]">
                  <span
                    className="text-[#9CA3AF] text-[12px] font-mono hover:text-white cursor-pointer"
                    title={transfer.destinationAddress}
                  >
                    {formatAddress(transfer.destinationAddress)}
                  </span>
                </div>

                {/* Initiated */}
                <div className="flex items-center justify-end h-[32px]">
                  <span className="text-[#84858C] text-[12px]">{formatDate(transfer.initiated)}</span>
                </div>

                {/* Transaction ID */}
                <div className="flex items-center justify-end h-[32px]">
                  <a
                    href={`https://app.hyperliquid.xyz/explorer/tx/${transfer.transactionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7637BA] text-[12px] font-mono hover:text-[#9047d9] transition-colors"
                    title={transfer.transactionId}
                  >
                    {formatTxId(transfer.transactionId)}
                  </a>
                </div>

                {/* Status */}
                <div className="flex items-center justify-end h-[32px]">
                  <span className="inline-flex items-center bg-[#00AF58]/20 text-[#00AF58] text-[10px] px-2 py-1 rounded-[4px]">
                    {transfer.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col h-full items-center justify-center bg-[#191B20] rounded-[20px] my-1">
            <Image src={dashboard.noDeposits} alt="No data" width={168} height={168} className="mb-4" />
            <p className="text-white text-[20px] font-semibold">
              {activeTab === "deposits" ? "No Deposits" : "No Withdrawals"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransfersTab;
