type TradingProviderEnum = "hyperliquid";

export type OrderType = "market" | "limit" | "trigger";

export type TifEnum = "Gtc" | "Ioc" | "Alo" | undefined;

interface LimitOrderType {
  asset: number;
  side: "buy" | "sell";
  size: string;
  type: "limit";
  price: string;
  reduceOnly?: boolean | undefined;
  timeInForce?: TifEnum;
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

export type OrderEnum = LimitOrderType | MarketOrderType | TriggerOrderType;

export interface TradeExecutionPayload {
  provider: TradingProviderEnum;
  wallet_address: string;
  orders: OrderEnum[];
  grouping?: GroupingType;
}

export interface UpdateLeveragePayload {
  provider: TradingProviderEnum;
  wallet_address: string;
  asset: number;
  leverage: number;
}
