"use client";
import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { Copy } from "@/components/icons/icons";
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
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  const { data: coinStatsData } = useFetchCoinStatsToken();
  const { mutate: fetchLedgerUpdates, data: ledgerUpdates } = useHyperliquidUserNonFundingLedgerUpdates();

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
          icon: "https://static.coinstats.app/coins/1650455771843.png",
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(text);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const getStatusStyles = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "completed") {
      return {
        backgroundColor: "#152F22",
        color: "#21FF86",
      };
    } else if (normalizedStatus === "pending" || normalizedStatus === "loading" || normalizedStatus === "processing") {
      return {
        backgroundColor: "#382B19",
        color: "#FFC26D",
      };
    } else if (normalizedStatus === "cancelled" || normalizedStatus === "failed" || normalizedStatus === "aborted") {
      return {
        backgroundColor: "#422825",
        color: "#F99185",
      };
    }

    return {
      backgroundColor: "#152F22",
      color: "#21FF86",
    };
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

      {/* Table Container */}
      <div className="flex-1 flex flex-col overflow-hidden px-3">
        {/* Header */}
        <div
          className="grid grid-cols-[1.2fr_1fr_0.8fr_1.5fr_1.3fr_1.3fr_0.9fr] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
          style={{
            height: "40px",
            paddingTop: "12px",
            paddingBottom: "12px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          <div className="text-[#84858C] text-[12px] font-medium">Asset</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Quantity</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Chain</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">
            {activeTab === "deposits" ? "Source Address" : "Destination Address"}
          </div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Initiated</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Transaction ID</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Status</div>
        </div>

        {/* Content */}
        {hasData ? (
          <div
            className="flex-1 overflow-auto no-scrollbar"
            style={{
              backgroundColor: "#191B20",
              borderRadius: "15px",
              border: "1px solid #222327",
              padding: "8px",
              marginTop: "8px",
            }}
          >
            {filteredTransfers.map((transfer: TransferData, index: number) => (
              <div
                key={`${transfer.transactionId}-${index}`}
                className="grid grid-cols-[1.2fr_1fr_0.8fr_1.5fr_1.3fr_1.3fr_0.9fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
                style={{
                  height: "48px",
                  paddingLeft: "12px",
                  paddingRight: "12px",
                }}
              >
                {/* Asset */}
                <div className="flex items-center gap-2">
                  <Image
                    src={transfer.assetIcon}
                    alt={transfer.assetName}
                    width={20}
                    height={20}
                    className="rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = "https://static.coinstats.app/coins/1650455771843.png";
                    }}
                  />
                  <span className="text-white text-[13px] font-medium">{transfer.assetName}</span>
                </div>

                {/* Quantity */}
                <span className="text-white text-[12px]">
                  {parseFloat(transfer.quantity).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })}{" "}
                  {transfer.assetName}
                </span>

                {/* Chain */}
                <span className="text-white text-[12px]">{transfer.chain}</span>

                {/* Source/Destination Address */}
                <span
                  className="text-white text-[12px] hover:text-[#9CA3AF] cursor-pointer transition-colors"
                  title={transfer.destinationAddress}
                >
                  {formatAddress(transfer.destinationAddress)}
                </span>

                {/* Initiated */}
                <span className="text-white text-[12px]">{formatDate(transfer.initiated)}</span>

                {/* Transaction ID */}
                <div className="flex items-center gap-2">
                  <a
                    href={`https://app.hyperliquid.xyz/explorer/tx/${transfer.transactionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-[12px] hover:text-[#7637BA] transition-colors"
                    title={transfer.transactionId}
                  >
                    {formatTxId(transfer.transactionId)}
                  </a>
                  <button
                    onClick={() => copyToClipboard(transfer.transactionId)}
                    className="hover:opacity-70 transition-opacity"
                    title="Copy transaction ID"
                  >
                    <div className="w-3 h-3 text-[#84858C]">
                      <Copy />
                    </div>
                  </button>
                </div>

                {/* Status */}
                <span
                  className="inline-flex items-center text-[10px] font-medium w-fit"
                  style={{
                    ...getStatusStyles(transfer.status),
                    borderRadius: "36px",
                    paddingTop: "5px",
                    paddingRight: "8px",
                    paddingBottom: "5px",
                    paddingLeft: "8px",
                  }}
                >
                  {transfer.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col h-full items-center justify-center rounded-[15px] my-1"
            style={{
              backgroundColor: "#191B20",
              border: "1px solid #222327",
            }}
          >
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
