// Alpaca API Types

export interface AlpacaBar {
  t: string; // timestamp (RFC-3339)
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
  n: number; // number of trades
  vw: number; // volume weighted average price
}

export interface AlpacaBarsResponse {
  bars: AlpacaBar[];
  symbol: string;
  next_page_token: string | null;
}

// WebSocket message types
export interface AlpacaWebSocketBar {
  T: "b"; // message type: bar
  S: string; // symbol
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
  vw: number; // volume weighted average price
  n: number; // number of trades
  t: string; // timestamp (RFC-3339)
}

export interface AlpacaWebSocketTrade {
  T: "t"; // message type: trade
  S: string; // symbol
  i: number; // trade ID
  x: string; // exchange
  p: number; // price
  s: number; // size
  c: string[]; // conditions
  t: string; // timestamp
  z: string; // tape
}

export interface AlpacaWebSocketQuote {
  T: "q"; // message type: quote
  S: string; // symbol
  ax: string; // ask exchange
  ap: number; // ask price
  as: number; // ask size
  bx: string; // bid exchange
  bp: number; // bid price
  bs: number; // bid size
  c: string[]; // condition
  t: string; // timestamp
  z: string; // tape
}

export type AlpacaWebSocketMessage =
  | AlpacaWebSocketBar
  | AlpacaWebSocketTrade
  | AlpacaWebSocketQuote
  | { T: "success" | "error" | "subscription"; msg?: string };

export interface AlpacaStock {
  symbol: string;
  name: string;
  exchange: string;
  type: "stock";
  sector?: string;
  industry?: string;
}

// Alpaca Assets API response
export interface AlpacaAsset {
  id: string;
  class: string; // "us_equity"
  exchange: string; // "NASDAQ", "NYSE", etc.
  symbol: string; // "AAPL"
  name: string; // "Apple Inc."
  status: string; // "active"
  tradable: boolean;
  marginable: boolean;
  maintenance_margin_requirement: number;
  shortable: boolean;
  easy_to_borrow: boolean;
  fractionable: boolean;
  attributes: string[];
}

// Snapshot API response
export interface AlpacaSnapshotData {
  latestTrade: {
    t: string; // timestamp
    x: string; // exchange
    p: number; // price
    s: number; // size
    c: string[]; // conditions
    i: number; // trade ID
    z: string; // tape
  };
  latestQuote: {
    t: string; // timestamp
    ax: string; // ask exchange
    ap: number; // ask price
    as: number; // ask size
    bx: string; // bid exchange
    bp: number; // bid price
    bs: number; // bid size
    c: string[]; // conditions
    z: string; // tape
  };
  minuteBar: {
    t: string; // timestamp
    o: number; // open
    h: number; // high
    l: number; // low
    c: number; // close
    v: number; // volume
    n: number; // number of trades
    vw: number; // VWAP
  };
  dailyBar: {
    t: string;
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    n: number;
    vw: number;
  };
  prevDailyBar: {
    t: string;
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    n: number;
    vw: number;
  };
}