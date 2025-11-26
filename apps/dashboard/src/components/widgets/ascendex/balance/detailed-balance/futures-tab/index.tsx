"use client";
import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import {
  useHyperliquidClearinghouseState,
  useHyperliquidAllMids,
  useHyperliquidMetaAndAssetCtxs,
  useHyperliquidUserFunding,
  useHyperliquidUserNonFundingLedgerUpdates,
} from "@/services/queries/hyperliquid-dex";
import { useFetchCoinStatsToken } from "@/services/queries/charts";
import {
  PositionData,
  PositionHistoryData,
  FundingData,
  LiquidationData,
} from "@/services/queries/hyperliquid-dex/types";

interface FuturesTabProps {
  userAddress: string;
}

const FuturesTab = ({ userAddress }: FuturesTabProps) => {
  const [activeTab, setActiveTab] = useState<"open-positions" | "position-history" | "funding" | "liquidation">(
    "open-positions",
  );

  const tabs = [
    { key: "open-positions", label: "Open Positions" },
    { key: "position-history", label: "Position History" },
    { key: "funding", label: "Funding" },
    { key: "liquidation", label: "Liquidation" },
  ];

  const { data: clearinghouse } = useHyperliquidClearinghouseState(userAddress, !!userAddress);
  const { data: allMids } = useHyperliquidAllMids();
  const { data: metaAndAssetCtxs } = useHyperliquidMetaAndAssetCtxs();
  const { data: coinStatsData } = useFetchCoinStatsToken();
  const { mutate: fetchFunding, data: fundingData } = useHyperliquidUserFunding();
  const { mutate: fetchLedger, data: ledgerData } = useHyperliquidUserNonFundingLedgerUpdates();

  useEffect(() => {
    if (userAddress && activeTab === "funding") {
      const endTime = Date.now();
      const startTime = endTime - 30 * 24 * 60 * 60 * 1000;
      fetchFunding({ userAddress, startTime, endTime });
    }
  }, [userAddress, activeTab, fetchFunding]);

  useEffect(() => {
    if (userAddress && activeTab === "liquidation") {
      const endTime = Date.now();
      const startTime = endTime - 90 * 24 * 60 * 60 * 1000;
      fetchLedger({ userAddress, startTime, endTime });
    }
  }, [userAddress, activeTab, fetchLedger]);

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

  const fundingRatesMap = useMemo(() => {
    if (!metaAndAssetCtxs || !Array.isArray(metaAndAssetCtxs) || metaAndAssetCtxs.length < 2) return {};

    const [meta, assetCtxs] = metaAndAssetCtxs;
    const map: Record<string, string> = {};

    if (meta?.universe && Array.isArray(assetCtxs)) {
      meta.universe.forEach((asset: any, index: number) => {
        const ctx = assetCtxs[index];
        if (ctx && ctx.funding) {
          map[asset.name] = ctx.funding;
        }
      });
    }

    return map;
  }, [metaAndAssetCtxs]);

  const positions = useMemo(() => {
    if (!clearinghouse?.assetPositions || clearinghouse.assetPositions.length === 0) {
      return [];
    }

    return clearinghouse.assetPositions.map((position): PositionData => {
      const pos = position.position;
      const coinSymbol = pos.coin;
      const coinInfo = coinInfoMap[coinSymbol] || {
        name: coinSymbol,
        icon: "https://static.coinstats.app/coins/default.png",
      };

      const szi = parseFloat(pos.szi);
      const isLong = szi > 0;
      const size = Math.abs(szi);
      const entryPrice = parseFloat(pos.entryPx);
      const markPrice = allMids?.[coinSymbol] ? parseFloat(allMids[coinSymbol]) : entryPrice;
      const positionValue = size * markPrice;
      const unrealizedPnl = parseFloat(pos.unrealizedPnl);
      const marginUsed = parseFloat(pos.marginUsed);
      const roe = parseFloat(pos.returnOnEquity) * 100;
      const liquidationPrice = pos.liquidationPx || "N/A";
      const fundingRate = fundingRatesMap[coinSymbol] || "0";

      const leverage = pos.leverage.type === "cross" ? "Cross" : `${pos.leverage.value}x`;

      return {
        coin: coinSymbol,
        name: coinInfo.name,
        icon: coinInfo.icon,
        size: `${isLong ? "+" : "-"}${size.toFixed(4)}`,
        side: isLong ? "Long" : "Short",
        positionValue,
        entryPrice,
        markPrice,
        pnl: unrealizedPnl,
        roe,
        liquidationPrice,
        margin: marginUsed,
        leverage,
        fundingRate: (parseFloat(fundingRate) * 100).toFixed(4) + "%",
      };
    });
  }, [clearinghouse, allMids, coinInfoMap, fundingRatesMap]);

  const positionHistory = useMemo(() => {
    if (!ledgerData) return [];

    return ledgerData
      .filter((item: any) => item.delta.type === "position")
      .map((item: any): PositionHistoryData => {
        const delta = item.delta;
        const coinSymbol = delta.coin;

        const coinInfo = coinInfoMap[coinSymbol] || {
          name: coinSymbol,
          icon: "https://static.coinstats.app/coins/default.png",
        };

        const size = parseFloat(delta.szi);
        const side = size > 0 ? "Long" : "Short";

        return {
          coin: coinSymbol,
          name: coinInfo.name,
          icon: coinInfo.icon,
          size: delta.szi,
          side,
          entryPrice: parseFloat(delta.entryPx),
          exitPrice: parseFloat(delta.exitPx),
          pnl: parseFloat(delta.pnl),
          time: item.time,
          hash: item.hash,
        };
      });
  }, [ledgerData, coinInfoMap]);

  const fundingHistory = useMemo(() => {
    if (!fundingData) return [];

    return fundingData.map((item: any): FundingData => {
      const delta = item.delta;
      const coinSymbol = delta.coin;
      const coinInfo = coinInfoMap[coinSymbol] || {
        name: coinSymbol,
        icon: "https://static.coinstats.app/coins/default.png",
      };

      return {
        coin: coinSymbol,
        name: coinInfo.name,
        icon: coinInfo.icon,
        fundingRate: (parseFloat(delta.fundingRate) * 100).toFixed(4) + "%",
        size: delta.szi,
        usdc: delta.usdc,
        time: item.time,
        hash: item.hash,
      };
    });
  }, [fundingData, coinInfoMap]);

  const liquidations = useMemo(() => {
    if (!ledgerData) return [];

    return ledgerData
      .filter((item: any) => item.delta.type === "liquidation")
      .map((item: any): LiquidationData => {
        const delta = item.delta;
        const coinSymbol = delta.coin;

        const coinInfo = coinInfoMap[coinSymbol] || {
          name: coinSymbol,
          icon: "https://static.coinstats.app/coins/default.png",
        };

        return {
          coin: coinSymbol,
          name: coinInfo.name,
          icon: coinInfo.icon,
          size: delta.szi,
          price: parseFloat(delta.px),
          pnl: parseFloat(delta.pnl),
          time: item.time,
          hash: item.hash,
        };
      });
  }, [ledgerData, coinInfoMap]);

  const formatNumber = (num: number) => {
    if (num === 0) return "0";
    if (Math.abs(num) < 0.00000001) return num.toExponential(2);
    return num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 8 });
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEmptyStateText = () => {
    switch (activeTab) {
      case "open-positions":
        return "No Open Positions";
      case "position-history":
        return "No Position History";
      case "funding":
        return "No Funding History";
      case "liquidation":
        return "No Liquidations";
      default:
        return "No Data";
    }
  };

  const renderOpenPositions = () => {
    if (positions.length === 0) return null;

    return positions.map((position) => {
      const isLong = position.side === "Long";
      const isProfitable = position.pnl >= 0;

      return (
        <div
          key={position.coin}
          className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
          style={{
            height: "64px",
            paddingTop: "16px",
            paddingBottom: "16px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          <div className="flex items-center gap-[12px] h-[32px]">
            <Image
              src={position.icon}
              alt={position.name}
              width={32}
              height={32}
              className="rounded-full"
              onError={(e) => {
                e.currentTarget.src = "https://static.coinstats.app/coins/default.png";
              }}
            />
            <div className="flex flex-col justify-center">
              <span className="text-white text-[12px] font-medium leading-tight">{position.name}</span>
              <span className="text-[#84858C] text-[12px] leading-tight">{position.coin}</span>
            </div>
          </div>

          <div className="flex flex-col items-start justify-center h-[32px]">
            <span className={`text-[12px] font-medium leading-tight ${isLong ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
              {position.size}
            </span>
            <span className="text-[#84858C] text-[10px] leading-tight">{position.side}</span>
          </div>

          <div className="flex flex-col items-end justify-center h-[32px]">
            <span className="text-white text-[12px] font-medium leading-tight">
              {formatPrice(position.positionValue)}
            </span>
          </div>

          <div className="flex flex-col items-end justify-center h-[32px]">
            <span className="text-white text-[12px] font-medium">{formatPrice(position.entryPrice)}</span>
          </div>

          <div className="flex flex-col items-end justify-center h-[32px]">
            <span className="text-white text-[12px] font-medium">{formatPrice(position.markPrice)}</span>
          </div>

          <div className="flex flex-col items-end justify-center h-[32px]">
            <span
              className={`text-[12px] font-medium leading-tight ${isProfitable ? "text-[#00AF58]" : "text-[#DC2626]"}`}
            >
              {isProfitable ? "+" : ""}
              {formatPrice(position.pnl)}
            </span>
            <span className={`text-[10px] leading-tight ${isProfitable ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
              {isProfitable ? "+" : ""}
              {position.roe.toFixed(2)}%
            </span>
          </div>

          <div className="flex flex-col items-end justify-center h-[32px]">
            <span className="text-white text-[12px] font-medium">
              {position.liquidationPrice === "N/A" ? "N/A" : formatPrice(parseFloat(position.liquidationPrice))}
            </span>
          </div>

          <div className="flex flex-col items-end justify-center h-[32px]">
            <span className="text-white text-[12px] font-medium">{formatPrice(position.margin)}</span>
            <span className="text-[#84858C] text-[10px] leading-tight">{position.leverage}</span>
          </div>

          <div className="flex flex-col items-end justify-center h-[32px]">
            <span className="text-white text-[12px] font-medium">{position.fundingRate}</span>
          </div>
        </div>
      );
    });
  };

  const renderPositionHistory = () => {
    if (positionHistory.length === 0) return null;

    return positionHistory.map((p: PositionHistoryData, index: number) => {
      const isProfit = p.pnl >= 0;

      return (
        <div
          key={`${p.hash}-${index}`}
          className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
          style={{
            height: "64px",
            paddingTop: "16px",
            paddingBottom: "16px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          <div className="flex items-center gap-[12px]">
            <Image src={p.icon} alt={p.name} width={32} height={32} className="rounded-full" />
            <div className="flex flex-col">
              <span className="text-white text-[12px]">{p.name}</span>
              <span className="text-[#84858C] text-[10px]">{p.coin}</span>
            </div>
          </div>

          <div className="text-white text-[12px] text-right">{p.size}</div>
          <div className="text-white text-[12px] text-right">{formatPrice(p.entryPrice)}</div>
          <div className="text-white text-[12px] text-right">{formatPrice(p.exitPrice)}</div>

          <div className={`text-[12px] text-right ${isProfit ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
            {isProfit ? "+" : ""}
            {formatPrice(p.pnl)}
          </div>
        </div>
      );
    });
  };

  const renderFunding = () => {
    if (fundingHistory.length === 0) return null;

    return fundingHistory.map((funding: FundingData, index: number) => {
      const usdcAmount = parseFloat(funding.usdc);
      const isPaid = usdcAmount < 0;
      return (
        <div
          key={`${funding.hash}-${index}`}
          className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
          style={{
            height: "64px",
            paddingTop: "16px",
            paddingBottom: "16px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          <div className="flex items-center gap-[12px] h-[32px]">
            <Image
              src={funding.icon}
              alt={funding.name}
              width={32}
              height={32}
              className="rounded-full"
              onError={(e) => {
                e.currentTarget.src = "https://static.coinstats.app/coins/default.png";
              }}
            />
            <div className="flex flex-col justify-center">
              <span className="text-white text-[12px] font-medium leading-tight">{funding.name}</span>
              <span className="text-[#84858C] text-[12px] leading-tight">{funding.coin}</span>
            </div>
          </div>

          <div className="flex items-center justify-end h-[32px]">
            <span className="text-white text-[12px] font-medium">{funding.fundingRate}</span>
          </div>

          <div className="flex items-center justify-end h-[32px]">
            <span className="text-white text-[12px]">{funding.size}</span>
          </div>

          <div className="flex items-center justify-end h-[32px]">
            <span className={`text-[12px] font-medium ${isPaid ? "text-[#DC2626]" : "text-[#00AF58]"}`}>
              {isPaid ? "" : "+"}
              {formatPrice(Math.abs(usdcAmount))}
            </span>
          </div>

          <div className="flex items-center justify-end h-[32px]">
            <span className="text-[#84858C] text-[12px]">{formatDate(funding.time)}</span>
          </div>
        </div>
      );
    });
  };

  const renderLiquidations = () => {
    if (liquidations.length === 0) return null;

    return liquidations.map((l: LiquidationData, index: number) => (
      <div
        key={`${l.hash}-${index}`}
        className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
        style={{
          height: "64px",
          padding: "16px 12px",
        }}
      >
        <div className="flex items-center gap-[12px]">
          <Image src={l.icon} alt={l.name} width={32} height={32} className="rounded-full" />
          <div className="flex flex-col">
            <span className="text-white text-[12px]">{l.name}</span>
            <span className="text-[#84858C] text-[10px]">{l.coin}</span>
          </div>
        </div>

        <div className="text-white text-[12px] text-right">{l.size}</div>
        <div className="text-white text-[12px] text-right">{formatPrice(l.price)}</div>

        <div className={`text-[12px] text-right text-[#DC2626]`}>{formatPrice(l.pnl)}</div>

        <div className="text-[#84858C] text-[12px] text-right">{formatDate(l.time)}</div>
      </div>
    ));
  };

  const hasData = useMemo(() => {
    switch (activeTab) {
      case "open-positions":
        return positions.length > 0;
      case "funding":
        return fundingHistory.length > 0;
      case "liquidation":
        return liquidations.length > 0;
      default:
        return false;
    }
  }, [activeTab, positions, fundingHistory, liquidations]);

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-white text-[22px] px-3 py-2">Futures</p>

      <div className="flex items-center px-3 pb-3">
        <div className="flex bg-[#222329] p-[2px] rounded-[6px]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`text-[12px] px-3 h-[24px] transition whitespace-nowrap rounded-[4px] ${
                activeTab === tab.key ? "bg-[#2B2C32] text-white" : "text-[#84858C]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden px-3">
        {/* Open Positions Header */}
        {activeTab === "open-positions" && (
          <div
            className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
            style={{
              height: "32px",
              paddingTop: "8px",
              paddingBottom: "8px",
              paddingLeft: "12px",
              paddingRight: "12px",
            }}
          >
            <div className="text-[#84858C] text-[12px] font-medium">Coin</div>
            <div className="text-[#84858C] text-[12px] font-medium text-left">Size</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Position Value</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Entry Price</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Mark Price</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">PNL (ROE%)</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Liq. Price</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Margin</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Funding</div>
          </div>
        )}

        {/* Position History Header */}
        {activeTab === "position-history" && (
          <div
            className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
            style={{
              height: "32px",
              paddingTop: "8px",
              paddingBottom: "8px",
              paddingLeft: "12px",
              paddingRight: "12px",
            }}
          >
            <div className="text-[#84858C] text-[12px] font-medium">Coin</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Side</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Size</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">PNL</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Close Price</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Time</div>
          </div>
        )}

        {/* Funding Header */}
        {activeTab === "funding" && (
          <div
            className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
            style={{
              height: "32px",
              paddingTop: "8px",
              paddingBottom: "8px",
              paddingLeft: "12px",
              paddingRight: "12px",
            }}
          >
            <div className="text-[#84858C] text-[12px] font-medium">Coin</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Funding Rate</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Position Size</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Payment (USDC)</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Time</div>
          </div>
        )}

        {/* Liquidation Header */}
        {activeTab === "liquidation" && (
          <div
            className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
            style={{
              height: "32px",
              paddingTop: "8px",
              paddingBottom: "8px",
              paddingLeft: "12px",
              paddingRight: "12px",
            }}
          >
            <div className="text-[#84858C] text-[12px] font-medium">Coin</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Size</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Liq Price</div>
            <div className="text-[#84858C] text-[12px] font-medium text-right">Time</div>
          </div>
        )}

        {/* Content */}
        {hasData ? (
          <div className="flex-1 overflow-auto no-scrollbar">
            {activeTab === "open-positions" && renderOpenPositions()}
            {activeTab === "funding" && renderFunding()}
            {activeTab === "position-history" && renderPositionHistory()}
            {activeTab === "liquidation" && renderLiquidations()}
          </div>
        ) : (
          <div className="flex flex-col h-full items-center justify-center bg-[#191B20] rounded-[20px] my-1">
            <Image src={dashboard.noOpenOrders} alt="No data" width={168} height={168} className="mb-4" />
            <p className="text-white text-[20px] font-semibold">{getEmptyStateText()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuturesTab;
