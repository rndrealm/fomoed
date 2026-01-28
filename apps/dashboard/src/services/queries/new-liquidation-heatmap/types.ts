export interface Kline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export interface OpenInterestData {
  timestamp: number;
  sumOpenInterest: number;
  sumOpenInterestValue: number;
}

export interface MergedBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  oiDelta: number;
}

export interface MergedDataResult {
  bars: MergedBar[];
  currentPrice: number;
}

export interface LiquidationLevel {
  priceTop: number;
  priceBottom: number;
  contracts: number;
  timestamp: number;
  direction: 1 | -1;
}

export interface HeatmapResult {
  longs: LiquidationLevel[];
  shorts: LiquidationLevel[];
  currentPrice: number;
  priceRange: [number, number];
}

export interface Config {
  symbol: string;
  leverages: number[];
  scaleTicks: number;
  dispersion: number;
  maxLevels: number;
  lookbackHours: number;
  interval: string;
}

export const DEFAULT_CONFIG: Config = {
  symbol: 'BTCUSDT',
  leverages: [125, 100, 50, 25],
  scaleTicks: 500,
  dispersion: 0.20,
  maxLevels: 500,
  lookbackHours: 48,
  interval: '15m',
};
