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
