export interface WeightedSentiment {
  value: number;
  datetime: Date;
}

export interface WeightedSentimentToken {
  availableSupply: string;
  contractAddresses: ContractAddress[];
  id: string;
  logoUrl: string;
  marketcapUsd: number;
  name: string;
  priceBtc: number;
  priceUsd: number;
  slug: string;
  ticker: string;
  totalSupply: string;
  volumeChange24h: number | null;
  volumeUsd: number;
}

export interface ContractAddress {
  address: string;
  decimals: number | null;
  description: null;
  label: string | null;
}
