export interface HyperLiquidKline {
  t: number;
  T: number;
  s: string;
  i: string;
  o: string;
  c: string;
  h: string;
  l: string;
  v: string;
  n: number;
}

export interface HyperLiquidSymbol {
  baseTokenName: string;
  quoteTokenName: string;
  price: string;
  isSpot: boolean;
  name: string;
}

export interface WsTradeResponse {
  channel: string;
  data: WsTrade[];
}

export interface WsTrade {
  coin: string;
  side: "A" | "B";
  px: string;
  sz: string;
  hash: string;
  time: number;
  // tid is 50-bit hash of (buyer_oid, seller_oid).
  // For a globally unique trade id, use (block_time, coin, tid)
  tid: number;
  users: [string, string]; // [buyer, seller]
}

export interface WsActiveAssetCtx {
  coin: string;
  ctx: PerpsAssetCtx;
}

export interface WsActiveSpotAssetCtx {
  coin: string;
  ctx: SpotAssetCtx;
}

type SharedAssetCtx = {
  dayNtlVlm: number;
  prevDayPx: number;
  markPx: number;
  midPx?: number;
};

type PerpsAssetCtx = SharedAssetCtx & {
  funding: number;
  openInterest: number;
  oraclePx: number;
};

type SpotAssetCtx = SharedAssetCtx & {
  circulatingSupply: number;
};

export interface WsClearingHouseStateResponse {
  channel: string;
  data: WsClearingHouseState;
}

export interface WsClearingHouseState {
  clearinghouseState: ClearinghouseState;
  dex: string;
  user: string;
}

interface ClearinghouseState {
  assetPositions: Array<AssetPosition>;
  marginSummary: MarginSummary;
  crossMarginSummary: MarginSummary;
  crossMaintenanceMarginUsed: number;
  withdrawable: number;
  time: number;
}

interface MarginSummary {
  accountValue: number;
  totalNtlPos: number;
  totalRawUsd: number;
  totalMarginUsed: number;
}

interface AssetPosition {
  type: "oneWay";
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
  liquidationPx: null | string;
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
  rawUsd?: string;
}

export interface WsOpenOrdersResponse {
  channel: string;
  data: WsOpenOrders;
}

export interface WsOpenOrders {
  dex: string;
  user: string;
  orders: Array<Order>;
}

interface Order {
  coin: string;
  side: string;
  limitPx: string;
  sz: string;
  oid: number;
  timestamp: number;
  triggerCondition: string;
  isTrigger: boolean;
  triggerPx: string;
  children: any[];
  isPositionTpsl: boolean;
  reduceOnly: boolean;
  orderType: string;
  origSz: string;
  tif: string;
  cloid: null;
}

export interface WsSpotStateResponse {
  channel: string;
  data: WsSpotState;
}

export interface WsSpotState {
  user: string;
  spotState: SpotState;
}

interface SpotState {
  balances: Balance[];
}

interface Balance {
  coin: string;
  token: number;
  total: string;
  hold: string;
  entryNtl: string;
}

export interface WsAllMidsResponse {
  channel: string;
  data: WsAllMids;
}

export interface WsAllMids {
  mids: Record<string, string>;
}

export interface WsUserHistoricalOrdersResponse {
  channel: string;
  data: Data;
}

interface Data {
  isSnapshot: boolean;
  user: string;
  orderHistory: WsOrderHistory[];
}

export interface WsOrderHistory {
  order: Order;
  status: Status;
  statusTimestamp: number;
}

enum Status {
  Canceled = "canceled",
  Filled = "filled",
  MinTradeNtlRejected = "minTradeNtlRejected",
  Open = "open",
  ReduceOnlyCanceled = "reduceOnlyCanceled",
}

export interface WsUserFillsResponse {
  channel: string;
  data: WsUserFillsData;
}

interface WsUserFillsData {
  isSnapshot: boolean;
  user: string;
  fills: WsUserFills[];
}

export interface WsUserFills {
  coin: string;
  px: string;
  sz: string;
  side: Side;
  time: number;
  startPosition: string;
  dir: Dir;
  closedPnl: string;
  hash: string;
  oid: number;
  crossed: boolean;
  fee: string;
  tid: number;
  feeToken: string;
  twapId: null;
}

export enum Dir {
  Buy = "Buy",
  CloseLong = "Close Long",
  CloseShort = "Close Short",
  OpenLong = "Open Long",
  OpenShort = "Open Short",
  Sell = "Sell",
}

enum Side {
  A = "A",
  B = "B",
}
