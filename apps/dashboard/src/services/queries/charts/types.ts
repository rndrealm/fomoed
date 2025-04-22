export interface CfgiDataResponse {
  date: string;
  price: number;
  cfgi: number;
  data_price: number;
  data_volatility: number;
  data_volume: number;
  data_impulse: number;
  data_technical: number;

  data_social: number;
  data_dominance: number;
  data_trends: number;
  datas_whales: number;
  data_orders: number;
  symbol: string;
}

export interface CoinListResponse {
  coins: Array<{
    i: string;
    ic: string;
    n: string;
    s: string;
    r: number;
    pu: number;
    pb: number;
    v: number;
    m: number;
    p24: number;
    p1: number;
    p1h: number;
    p7d: number;
    p7: number;
    p30?: number;
    c?: string;
  }>;
}

export interface CoinDataInterface {
  price: number;
  priceChange: number;
  marketCap: number;
  volume: number;
  icon: string;
  symbol: string;
  name: string;
  color: string | undefined;
  slug: string;
  is_free: boolean;
}

export enum CFGIEnum {
  E_FEAR = "Extreme Fear",
  FEAR = "Fear",
  GREED = "Greed",
  E_GREED = "Extreme Greed",
}

export type ForeignInstrument = {
  instrumentId: string;
  baseAsset: string;
  quoteAsset: string;
};

type ExchangeName = string;

export type SupportedPairsData = Record<ExchangeName, ForeignInstrument[]>;

export type InstrumentInfo = ForeignInstrument & {
  exchange: string;
  symbol: string;
};

export interface LiquidMapDataResponse {
  liquidationData: {
    code: string;
    msg: string;
    data: {
      data: Record<string, Array<Array<number | undefined>>>;
    };
    success: boolean;
  };
  pairMarketData: {
    instrumentId: string;
    exName: string;
    symbol: string;
    longVolUsd: number;
    shortVolUsd: number;
    longNumber: number;
    shortNumber: number;
    volUsd: number;
    volUsdChangePercent24h: number;
    price: number;
    indexPrice: number;
    priceChangePercent24h: number;
    openInterestAmount: number;
    openInterest: number;
    oiChangePercent24h: number;
    longLiquidationUsd24h: number;
    shortLiquidationUsd24h: number;
    fundingRate: number;
    nextFundingTime: number;
    oiVolRadio: number;
    oiVolRadioChangePercent24h: number;
  };
}

export type LiquidationBar = {
  x: number;
  y: number;
  color: string;
};

export interface FormatLiquidationDataResult {
  liqBars: LiquidationBar[];
  currentPrice: number | null;
  cumulativeLongLiqLeverage: { x: number; y: number }[];
  cumulativeShortLiqLeverage: { x: number; y: number }[];
  maxCumulativeValue: number;
  minPrice: number;
  maxPrice: number;
}

export interface LiquidHeatmapResponse {
  y: Array<number>;
  liq: Array<Array<number>>;
  prices: Array<[number, string, string, string, string, string]>;
  updateTime: number;
}

export interface LiquidExchangeResponse {
  currentPriceUsd: number;
  exLiqData: {
    Binance: Record<string, number>;
    Bybit: Record<string, number>;
    OKX: Record<string, number>;
  };
}

// export type FormatMergetLiquidMapDataResponse = {
//   cumulativeLongLiqLeverage: { x: number; y: number }[];
//   cumulativeShortLiqLeverage: { x: number; y: number }[];
//   liqBars: LiquidationBar[];
//   currentPrice: number;
//   minPrice: number;
//   maxPrice: number;
//   maxCumulativeValue: number;
// };
