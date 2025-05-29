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

export interface DexQuoteParams {
  userAddress?: string;
  receiverAddress?: string;
  originChainId?: string;
  destinationChainId?: string;
  inputToken?: string;
  outputToken?: string;
  inputAmount?: string;
}

export interface DexQuoteResult {
  originChainId: number;
  destinationChainId: number;
  userAddress: string;
  receiverAddress: string;
  input: {
    token: {
      chainId: number;
      address: string;
      name: string;
      symbol: string;
      decimals: number;
      logoURI: string;
      icon: string;
    };
    amount: string;
    priceInUsd: number;
    valueInUsd: number;
  };
  destinationExec: any;
  autoRoute: any;
  manualRoutes: Array<{
    quoteId: string;
    quoteExpiry: number;
    output: {
      token: {
        chainId: number;
        address: string;
        name: string;
        symbol: string;
        decimals: number;
        logoURI: string;
        icon: string;
      };
      amount: string;
      priceInUsd: number;
      valueInUsd: number;
      minAmountOut: string;
      effectiveReceivedInUsd: number;
    };
    affiliateFee: any;
    approvalData: any;
    gasFee: {
      gasToken: {
        chainId: number;
        address: string;
        symbol: string;
        name: string;
        decimals: number;
        icon: string;
        logoURI: string;
        chainAgnosticId: any;
      };
      gasLimit: string;
      gasPrice: string;
      estimatedFee: string;
      feeInUsd: number;
    };
    slippage: number;
    routeDetails: {
      name: string;
      logoURI: string;
      routeFee: any;
      dexDetails: any;
    };
    refuel: any;
  }>;
}
