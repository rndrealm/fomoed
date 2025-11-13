export type HyperliquidPerpListResponse = [
  {
    universe: PerpUniverse[];
    marginTables: Array<Array<MarginTableClass | number>>;
    collateralToken: number;
  },

  PerpPriceVolume[],
];

interface MarginTableClass {
  description: string;
  marginTiers: MarginTier[];
}

interface MarginTier {
  lowerBound: string;
  maxLeverage: number;
}

export interface PerpUniverse {
  szDecimals: number;
  name: string;
  maxLeverage: number;
  marginTableId: number;
  isDelisted?: boolean;
  onlyIsolated?: boolean;
  marginMode?: MarginMode;
  baseTokenName?: string;
  symbol?: string;
  isSpot?: boolean;
  quoteTokenName: string;
  tradingViewName: string;
  priceVolume?: PerpPriceVolume;
}

enum MarginMode {
  StrictIsolated = "strictIsolated",
}

export type HyperliquidSpotListResponse = [
  {
    universe: Universe[];
    tokens: Token[];
  },
  PriceVolume[],
];

interface Token {
  name: string;
  szDecimals: number;
  weiDecimals: number;
  index: number;
  tokenId: string;
  isCanonical: boolean;
  evmContract: EvmContract | null;
  fullName: null | string;
  deployerTradingFeeShare: string;
}

interface EvmContract {
  address: string;
  evm_extra_wei_decimals: number;
}

export interface Universe {
  tokens: number[];
  name: string;
  szDecimals: number;
  weiDecimals: number;
  index: number;
  tokenId: string;
  isCanonical: boolean;
  evmContract: EvmContract | null;
  fullName: null | string;
  deployerTradingFeeShare: string;
  baseTokenName?: string;
  symbol?: string;
  isSpot?: boolean;
}

interface PriceVolume {
  prevDayPx: string;
  dayNtlVlm: string;
  markPx: string;
  midPx: string;
  circulatingSupply: string;
  coin: string;
  totalSupply: string;
  dayBaseVlm: string;
  impactPxs: string[];
  openInterest?: string;
}

interface PerpPriceVolume {
  funding: string;
  openInterest: string;
  prevDayPx: string;
  dayNtlVlm: string;
  premium: string;
  oraclePx: string;
  markPx: string;
  midPx: string;
  impactPxs: string[];
  dayBaseVlm: string;
}

export interface SelectedHyperLiquidToken {
  baseTokenName: string;
  symbol: string;
  isSpot: boolean;
  priceVolume: PriceVolume;
  tradingViewName: string;
  quoteTokenName: string;
  tokens: number[];
  name: string;
  szDecimals: number;
  weiDecimals: number;
  index: number;
  tokenId: string;
  isCanonical: boolean;
  evmContract: EvmContract | null;
  fullName: null | string;
  deployerTradingFeeShare: string;
}

export interface SpotsUniverse {
  baseTokenName: string;
  symbol: string;
  isSpot: boolean;
  priceVolume: PriceVolume;
  tradingViewName: string;
  quoteTokenName: string;
  tokens: number[];
  name: string;
  szDecimals: number;
  weiDecimals: number;
  index: number;
  tokenId: string;
  isCanonical: boolean;
  maxLeverage?: number;
}
