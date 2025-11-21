// ==================== CLEARINGHOUSE STATE ====================

export interface HyperliquidClearinghouseState {
  marginSummary: {
    accountValue: string;
    totalNtlPos: string;
    totalRawUsd: string;
    totalMarginUsed: string;
  };
  crossMarginSummary: {
    accountValue: string;
    totalNtlPos: string;
    totalRawUsd: string;
    totalMarginUsed: string;
  };
  crossMaintenanceMarginUsed: string;
  withdrawable: string;
  assetPositions: HyperliquidAssetPosition[];
  time: number;
}

export interface HyperliquidAssetPosition {
  position: {
    coin: string;
    entryPx: string;
    leverage: {
      type: "cross" | "isolated";
      value: number;
      rawUsd?: string;
    };
    liquidationPx: string | null;
    marginUsed: string;
    maxTradeSzs: string[];
    positionValue: string;
    returnOnEquity: string;
    szi: string;
    unrealizedPnl: string;
  };
  type: "oneWay";
}

// ==================== SPOT STATE ====================

export interface HyperliquidSpotState {
  balances: HyperliquidSpotBalance[];
}

export interface HyperliquidSpotBalance {
  coin: string;
  token: number;
  total: string;
  hold: string;
  entryNtl: string;
}

// ==================== PORTFOLIO ====================

export interface HyperliquidPortfolio {
  day: HyperliquidPortfolioPeriod;
  week: HyperliquidPortfolioPeriod;
  month: HyperliquidPortfolioPeriod;
  allTime: HyperliquidPortfolioPeriod;
  perpDay: HyperliquidPortfolioPeriod;
  perpWeek: HyperliquidPortfolioPeriod;
  perpMonth: HyperliquidPortfolioPeriod;
  perpAllTime: HyperliquidPortfolioPeriod;
}

export interface HyperliquidPortfolioPeriod {
  accountValueHistory: [number, string][]; // [timestamp, value]
  pnlHistory: [number, string][]; // [timestamp, pnl]
  vlm: string;
}

// ==================== ORDERS ====================

export interface HyperliquidOpenOrder {
  coin: string;
  isPositionTpsl: boolean;
  isTrigger: boolean;
  limitPx: string;
  oid: number;
  orderType: "Limit" | "Market" | "Stop" | "StopLimit" | "TakeProfit" | "TakeProfitLimit";
  origSz: string;
  reduceOnly: boolean;
  side: "A" | "B"; // A = Ask (Sell), B = Bid (Buy)
  sz: string;
  timestamp: number;
  triggerCondition: string;
  triggerPx: string;
  tif?: string;
  cloid?: string | null;
}

export interface HyperliquidHistoricalOrder {
  order: HyperliquidOpenOrder;
  status:
    | "open"
    | "filled"
    | "canceled"
    | "triggered"
    | "rejected"
    | "marginCanceled"
    | "vaultWithdrawalCanceled"
    | "openInterestCapCanceled"
    | "selfTradeCanceled"
    | "reduceOnlyCanceled"
    | "siblingFilledCanceled"
    | "delistedCanceled"
    | "liquidatedCanceled"
    | "scheduledCancel";
  statusTimestamp: number;
}

// ==================== FILLS ====================

export interface HyperliquidFill {
  coin: string;
  px: string;
  sz: string;
  side: "A" | "B";
  time: number;
  startPosition: string;
  dir: "Open Long" | "Open Short" | "Close Long" | "Close Short" | "Buy" | "Sell";
  closedPnl: string;
  hash: string;
  oid: number;
  crossed: boolean;
  fee: string;
  tid: number;
  feeToken: string;
  builderFee?: string;
}

export interface HyperliquidTwapSliceFill {
  fill: HyperliquidFill;
  twapId: number;
}

// ==================== MARKET DATA ====================

export interface HyperliquidAllMids {
  [coin: string]: string; // e.g., "BTC": "95000.5"
}

export interface HyperliquidMeta {
  universe: HyperliquidAssetInfo[];
}

export interface HyperliquidAssetInfo {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  onlyIsolated: boolean;
}

export interface HyperliquidSpotMeta {
  universe: HyperliquidSpotAssetInfo[];
  tokens: HyperliquidTokenInfo[];
}

export interface HyperliquidSpotAssetInfo {
  name: string;
  tokens: [number, number]; // [base token index, quote token index]
  index: number;
  isCanonical: boolean;
}

export interface HyperliquidTokenInfo {
  name: string;
  szDecimals: number;
  weiDecimals: number;
  index: number;
  tokenId: string;
  evmContract?: string;
}

// ==================== USER INFO ====================

export interface HyperliquidUserFees {
  dailyUserVlm: {
    date: string;
    userCross: string;
    userAdd: string;
    exchange: string;
  }[];
  feeSchedule: {
    cross: string;
    add: string;
    spotCross: string;
    spotAdd: string;
    tiers: {
      vip: {
        ntlCutoff: string;
        cross: string;
        add: string;
        spotCross: string;
        spotAdd: string;
      }[];
      mm: {
        makerFractionCutoff: string;
        add: string;
      }[];
    };
    referralDiscount: string;
    stakingDiscountTiers: {
      bpsOfMaxSupply: string;
      discount: string;
    }[];
  };
  userCrossRate: string;
  userAddRate: string;
  userSpotCrossRate: string;
  userSpotAddRate: string;
  activeReferralDiscount: string;
  trial: any | null;
  feeTrialReward: string;
  nextTrialAvailableTimestamp: number | null;
  stakingLink?: {
    type: string;
    stakingUser: string;
  };
  activeStakingDiscount?: {
    bpsOfMaxSupply: string;
    discount: string;
  };
}

export interface HyperliquidUserRole {
  role: "user" | "agent" | "vault" | "subAccount" | "missing";
}

export interface HyperliquidSubAccount {
  name: string;
  subAccountUser: string;
  master: string;
  clearinghouseState: HyperliquidClearinghouseState;
  spotState: HyperliquidSpotState;
}

// ==================== CANDLES ====================

export interface HyperliquidCandle {
  T: number; // Close time
  c: string; // Close price
  h: string; // High price
  i: string; // Interval
  l: string; // Low price
  n: number; // Number of trades
  o: string; // Open price
  s: string; // Symbol
  t: number; // Open time
  v: string; // Volume
}

// ==================== ORDER BOOK ====================

export interface HyperliquidL2Book {
  coin: string;
  time: number;
  levels: [
    // [bids, asks]
    {
      px: string; // Price
      sz: string; // Size
      n: number; // Number of orders
    }[],
    {
      px: string;
      sz: string;
      n: number;
    }[]
  ];
}

// ==================== ORDER STATUS ====================

export interface HyperliquidOrderStatus {
  status: "order" | "orderNotFound";
  order?: {
    order: HyperliquidOpenOrder;
    status: string;
    statusTimestamp: number;
  };
}