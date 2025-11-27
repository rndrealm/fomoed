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
  accountValueHistory: [number, string][]; 
  pnlHistory: [number, string][]; 
  vlm: string;
}


export interface HyperliquidOpenOrder {
  coin: string;
  isPositionTpsl: boolean;
  isTrigger: boolean;
  limitPx: string;
  oid: number;
  orderType: "Limit" | "Market" | "Stop" | "StopLimit" | "TakeProfit" | "TakeProfitLimit";
  origSz: string;
  reduceOnly: boolean;
  side: "A" | "B";
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


export interface HyperliquidAllMids {
  [coin: string]: string; 
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
  tokens: [number, number]; 
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


export interface HyperliquidCandle {
  T: number;
  c: string; 
  h: string; 
  i: string; 
  l: string; 
  n: number; 
  o: string; 
  s: string; 
  t: number; 
  v: string; 
}


export interface HyperliquidL2Book {
  coin: string;
  time: number;
  levels: [
    {
      px: string; 
      sz: string;
      n: number; 
    }[],
    {
      px: string;
      sz: string;
      n: number;
    }[]
  ];
}


export interface HyperliquidOrderStatus {
  status: "order" | "orderNotFound";
  order?: {
    order: HyperliquidOpenOrder;
    status: string;
    statusTimestamp: number;
  };
}


export interface HyperliquidFundingUpdate {
  delta: {
    coin: string;
    fundingRate: string;
    szi: string;
    type: "funding";
    usdc: string;
  };
  hash: string;
  time: number;
}

export interface HyperliquidLedgerUpdate {
  delta: {
    type: "deposit" | "withdraw" | "internalTransfer" | "subAccountTransfer";
    usdc?: string;
    token?: number;
    amount?: string;
    [key: string]: any;
  };
  hash: string;
  time: number;
}

export interface HyperliquidFundingHistoryEntry {
  coin: string;
  fundingRate: string;
  premium: string;
  time: number;
}

export interface HyperliquidAssetContext {
  dayNtlVlm: string;
  funding: string;
  impactPxs: [string, string];
  markPx: string;
  midPx: string;
  openInterest: string;
  oraclePx: string;
  premium: string;
  prevDayPx: string;
}

export interface PositionData {
  coin: string;
  name: string;
  icon: string;
  size: string;
  side: "Long" | "Short";
  positionValue: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  roe: number;
  liquidationPrice: string;
  margin: number;
  leverage: string;
  fundingRate: string;
}

export interface PositionHistoryData {
  coin: string;
  name: string;
  icon: string;
  size: string;
  side: "Long" | "Short";
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  time: number;
  hash: string;
}

export interface FundingData {
  coin: string;
  name: string;
  icon: string;
  fundingRate: string;
  size: string;
  usdc: string;
  time: number;
  hash: string;
}

export interface LiquidationData {
  coin: string;
  name: string;
  icon: string;
  size: string;
  price: number;
  pnl: number;
  time: number;
  hash: string;
}