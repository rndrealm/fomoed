export interface AscendexMarketData {
  totalMarkets: number;
  markets: string[];
}

export interface AscendexMarketTicker {
  symbol: string;
  high: number;
  low: number;
  bid: number;
  bidVolume: number;
  ask: number;
  askVolume: number;
  open: number;
  close: number;
  last: number;
  change: number;
  percentage: number;
  average: number;
  baseVolume: number;
  info: Info;
}

interface Info {
  symbol: string;
  open: string;
  close: string;
  high: string;
  low: string;
  volume: string;
  ask: string[];
  bid: string[];
  type: string;
}
