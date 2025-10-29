export interface HyperLiquidLeaderboard {
  ethAddress: string;
  accountValue: string;
  windowPerformances: [
    [
      "day",
      {
        pnl: string;
        roi: string;
        vlm: string;
      },
    ],
    [
      "week",
      {
        pnl: string;
        roi: string;
        vlm: string;
      },
    ],
    [
      "month",
      {
        pnl: string;
        roi: string;
        vlm: string;
      },
    ],
    [
      "allTime",
      {
        pnl: string;
        roi: string;
        vlm: string;
      },
    ],
  ];
  prize: number;
  displayName: string;
}

export interface GemachUserData {
  address: string;
  isNewUser: boolean;
  autoBuy: number;
  refCode: string;
  holdList: any[];
  balance: number;
  setting: Setting;
  chainId: string;
}

interface Setting {
  quickBuyAmount: string;
  quickBuySlippage: number;
  quickSellPercent: number;
  quickSellSlippage: number;
  buyPriorityFee: number;
  sellPriorityFee: number;
}

export interface GemachUserBalance {
  gdexBalance: number;
  hyperliquidBalance: number;
}

export interface CopyTrade {
  _id: string;
  copyTradeId: string;
  copyTradeName: string;
  copyMode: number;
  isActive: boolean;
  userId: string;
  userWallet: string;
  traderWallet: string;
  lossPercent: number;
  profitPercent: number;
  fixedAmountCostPerOrder: string;
  createdAt: number;
  lastUpdated: number;
  oppositeCopy: boolean;
  __v: number;
  totalTrades: number;
  totalVolumes: number;
  totalPnl: number;
}

export type TimeWindow = "day" | "week" | "month" | "allTime";

export interface TradeHistoryData {
  fills: Fill[];
  pagination: Pagination;
}

interface Fill {
  _id: string;
  tid: number;
  side: Side;
  time: number;
  oid: number;
  userAddress: string;
  __v: number;
  builderFee: string;
  closedPnl: string;
  coin: string;
  crossed: boolean;
  dir: Dir;
  fee: string;
  feeToken: string;
  hash: string;
  px: string;
  startPosition: string;
  sz: string;
  copyTradeName: CopyTradeName;
  traderTxHash: string;
  traderSize: string;
  traderPrice: string;
  traderWallet: string;
}

enum CopyTradeName {
  NA = "N/A",
  TestTrade = "TEST TRADE",
}

enum Dir {
  CloseShort = "Close Short",
  OpenShort = "Open Short",
}

enum Side {
  A = "A",
  B = "B",
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UserStats {
  "24h": number;
  "7d": number;
  "30d": number;
  week: number;
  dailyPnls: DailyPnl[];
  volumes: CapitalDeployed;
  tradesCount: TradesCount;
  percentagePnl: CapitalDeployed;
  capitalDeployed: CapitalDeployed;
  allTime: AllTime;
  lastUpdated: number;
}

interface AllTime {
  pnl: number;
  pnlPercentage: number;
  capitalDeployed: number;
}

interface CapitalDeployed {
  "24h": number;
  "7d": number;
  "30d": number;
  week: number;
}

interface DailyPnl {
  timeMs: number;
  date: Date;
  pnl: number;
  pnlPercentage: number;
  capitalDeployed: number;
}

interface TradesCount {
  "24h": The24_H;
  "7d": The24_H;
  "30d": The24_H;
  week: The24_H;
}

interface The24_H {
  win: number;
  lose: number;
  total: number;
}

export interface GemachOpenPositions {
  marginSummary: MarginSummary;
  crossMarginSummary: MarginSummary;
  crossMaintenanceMarginUsed: string;
  withdrawable: string;
  assetPositions: AssetPosition[];
  time: number;
}

interface AssetPosition {
  type: string;
  position: Position;
}

interface Position {
  coin: string;
  szi: string;
  leverage: Leverage;
  entryPx: string;
  positionValue: string;
  unrealizedPnl: string;
  returnOnEquity: string;
  liquidationPx: string;
  marginUsed: string;
  maxLeverage: number;
  cumFunding: CumFunding;
}

interface CumFunding {
  allTime: string;
  sinceOpen: string;
  sinceChange: string;
}

interface Leverage {
  type: string;
  value: number;
}

interface MarginSummary {
  accountValue: string;
  totalNtlPos: string;
  totalRawUsd: string;
  totalMarginUsed: string;
}
