type TradingProviderEnum = "hyperliquid";

export type OrderType = "market" | "limit" | "conditional";

interface LimitOrderType {
  asset: number;
  side: "buy" | "sell";
  size: string;
  type: "limit";
  price: string;
  reduceOnly?: boolean | undefined;
  timeInForce?: "Gtc" | "Ioc" | "Alo" | undefined;
}

interface MarketOrderType {
  asset: number;
  side: "buy" | "sell";
  size: string;
  type: "market";
  reduceOnly?: boolean | undefined;
}

interface TriggerOrderType {
  asset: number;
  side: "buy" | "sell";
  size: string;
  type: "trigger";
  triggerPrice: string;
  isMarket: boolean;
  tpsl: "tp" | "sl";
  reduceOnly?: boolean | undefined;
}

type GroupingType = "na" | "normalTpsl" | "positionTpsl";

export interface TradeExecutionPayload {
  provider: TradingProviderEnum;
  wallet_address: string;
  orders: (LimitOrderType | MarketOrderType | TriggerOrderType)[];
  grouping?: GroupingType;
}
