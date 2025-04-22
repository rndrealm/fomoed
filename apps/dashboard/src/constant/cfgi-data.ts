export const cfgi_supported_tokens = [
  "BTC",
  "ETH",
  "BNB",
  "XRP",
  "SOL",
  "ADA",
  "LUNA",
  "AVAX",
  "DOGE",
  "DOT",
  "SHIB",
  "MATIC",
  "CRO",
  "TRX",
  "XLM",
  "LINK",
  "UNI",
  "FTM",
  "ALGO",
  "MANA",
  "LTC",
  "LEO",
  "FTT",
  "NEAR",
  "BCH",
  "ETC",
  "XMR",
  "ATOM",
  "VET",
  "HBAR",
  "FLOW",
  "ICP",
  "APE",
  "EGLD",
  "XTZ",
  "THETA",
  "XTZ",
  "THETA",
  "HNT",
  "FIL",
  "BSV",
  "AXS",
  "SAND",
  "ZEC",
  "EOS",
  "IOTA",
  "PEPE",
  "ARB",
  "INJ",
  "GRT",
  "WIF",
  "SUI",
  "BGB",
  "BONK",
  "NOT",
  "AAVE",
  "JUP",
  "SEI",
  "GALA",
  "BTT",
  "TON",
  "NEIRO",
  "BABYDOGE",
  "SUI",
  "FET",
  "EIGEN",
  "DOG",
  "POLY",
  "APU",
  "SPX",
  "GIGA",
  "BITCOIN",
  "MOG",
  "POPCAT",
  "BOBO",
  "TET",
  "WOJAK",
  "KAS",
  "MOODENG",
  "FLOKI",
  "RUNE",
  "TRUMP",
  "MELANIA",
];

export enum CFGI_SUPPORTED_PERIODS_ENUM {
  MIN15 = 1,
  HOUR1 = 2,
  HOUR4 = 3,
  HOUR7 = "7H",
  DAY1 = 4,
  MONTH1 = "1M",
  YEAR1 = "1Y",
}

export type CfgiPeriodOption = {
  label: string;
  value: any;
  disabled?: boolean;
  requiresPremium?: boolean;
  periodInSeconds: number;
};

export const CfgiPeriods: CfgiPeriodOption[] = [
  {
    label: "24H",
    value: CFGI_SUPPORTED_PERIODS_ENUM.DAY1,
    periodInSeconds: 24 * 60 * 60,
  },
  {
    label: "4H",
    value: CFGI_SUPPORTED_PERIODS_ENUM.HOUR4,
    periodInSeconds: 4 * 60 * 60,
  },
  {
    label: "1H",
    value: CFGI_SUPPORTED_PERIODS_ENUM.HOUR1,
    periodInSeconds: 1 * 60 * 60,
  },
  {
    label: "15M",
    value: CFGI_SUPPORTED_PERIODS_ENUM.MIN15,
    periodInSeconds: 15 * 60,
  },
];

export interface OptionsType {
  value: string;
  label: string;
}

export const liquidHeatMapTimeframeOptions = [
  { label: "12 hours", value: "12h" },
  { label: "24 hours", value: "24h" },
  { label: "3 days", value: "3d" },
  { label: "1 week", value: "7d" },
  { label: "1 month", value: "30d" },
  { label: "3 months", value: "90d" },
  { label: "6 months", value: "180d" },
  { label: "1 year", value: "1y" },
];

export const liquidTimeframeOptions = [
  { label: "1 day", value: "1d" },
  { label: "7 days", value: "7d" },
];

export const TabOptions = [
  { value: "sentiment", label: "Sentiment" },
  { value: "both", label: "Price and Sentiment" },
];
export const LiquidTabOptions = [
  { value: "volume", label: "Volume Only" },
  { value: "cummulative", label: "Cummulative Only" },
];
