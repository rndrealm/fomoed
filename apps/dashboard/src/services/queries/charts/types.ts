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
  instrument_id: string;
  base_asset: string;
  quote_asset: string;
  onboard_date: number;
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
    data: {
      data: Record<string, Array<Array<number | undefined>>>;
      last_price: number;
    };
  };
  pairMarketData: {
    instrument_id: string;
    exchange_name: string;
    symbol: string;
    current_price: number;
    index_price: number;
    price_change_percent_24h: number;
    volume_usd: number;
    volume_usd_change_percent_24h: number;
    long_volume_usd: number;
    short_volume_usd: number;
    long_volume_quantity: number;
    short_volume_quantity: number;
    open_interest_quantity: number;
    open_interest_usd: number;
    open_interest_change_percent_24h: number;
    long_liquidation_usd_24h: number;
    short_liquidation_usd_24h: number;
    funding_rate: number;
    next_funding_time: number;
    open_interest_volume_radio: number;
    oi_vol_ratio_change_percent_24h: number;
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
  y_axis: Array<number>;
  liquidation_leverage_data: Array<Array<number>>;
  price_candlesticks: Array<[number, string, string, string, string, string]>;
}

export interface LiquidExchangeResponse {
  currentPriceUsd: number;
  exLiqData: {
    Binance: Record<string, number>;
    Bybit: Record<string, number>;
    OKX: Record<string, number>;
  };
}

export interface BinanceKlineFormatted {
  time: number; // seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export type BinanceKlineRaw = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
];

export type Ticker = {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
};

// export type FormatMergetLiquidMapDataResponse = {
//   cumulativeLongLiqLeverage: { x: number; y: number }[];
//   cumulativeShortLiqLeverage: { x: number; y: number }[];
//   liqBars: LiquidationBar[];
//   currentPrice: number;
//   minPrice: number;
//   maxPrice: number;
//   maxCumulativeValue: number;
// };

export interface BtcDominanceResponse {
  active_cryptocurrencies: number;
  upcoming_icos: number;
  ongoing_icos: number;
  ended_icos: number;
  markets: number;
  total_market_cap: { [key: string]: number };
  total_volume: { [key: string]: number };
  market_cap_percentage: { [key: string]: number };
  market_cap_change_percentage_24h_usd: number;
  updated_at: number;
}

export interface BinanceSymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
}

export interface CoinStatsTokenInfo {
  id: string;
  icon: string;
  name: string;
  symbol: string;
  rank: number;
  price: number;
  priceBtc: number;
  volume: number;
  marketCap: number;
  availableSupply: number;
  totalSupply: number;
  fullyDilutedValuation: number;
  priceChange1h: number;
  priceChange1d: number;
  priceChange1w: number;
  redditUrl: string;
  websiteUrl: string;
  twitterUrl: string;
  explorers: string[];
}

export interface BinanceTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface PriceDataItem {
  t: number,
  p: string
}

export interface OrderBookDataItem {
  time: number,
  bids_usd: number,
  asks_usd: number
}

export interface OrderBookDeltaResponse {
  priceData: PriceDataItem[],
  orderBookData: OrderBookDataItem[]
}

export interface ExchangePairOption {
  label: string;
  value: {
    exchange: string;
    symbol: string;
    base_asset: string;
  };
}

export interface WhaleTransaction {
  token: string;
  time: number;
  direction: 'Long' | 'Short';
  value: number;
}

export interface WhaleTransactionResponse {
  data: WhaleTransaction[];
}