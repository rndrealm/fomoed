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
