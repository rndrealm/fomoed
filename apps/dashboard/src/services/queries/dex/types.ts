export interface SingleTokenType {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  isShortListed: boolean;
  tags: Array<any>;
  trendingRank?: number;
  marketCap?: number;
  totalVolume?: number;
  balance: string;
  balanceInUsd: number;
  isVerified: boolean;
}

export type TokenListResponse = Record<string, SingleTokenType[]>;

export interface ChainType {
  chainId: number;
  name: string;
  icon: string;
  currency: {
    address: string;
    icon: string;
    name: string;
    symbol: string;
    decimals: number;
    minNativeCurrencyForGas: string;
  };
  explorers: Array<string>;
  sendingEnabled: boolean;
  receivingEnabled: boolean;
  isAutoEnabled: boolean;
  isManualEnabled: boolean;
}
