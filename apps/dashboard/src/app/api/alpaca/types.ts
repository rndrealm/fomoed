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

export interface AlpacaWebSocketBar {
  T: "b"; 
  S: string; 
  o: number; 
  h: number; 
  l: number; 
  c: number; 
  v: number; 
  vw: number; 
  n: number; 
  t: string; 
}

export interface AlpacaWebSocketTrade {
  T: "t"; 
  S: string; 
  i: number; 
  x: string; 
  p: number; 
  s: number;
  c: string[];
  t: string; 
  z: string; 
}

export interface AlpacaWebSocketQuote {
  T: "q"; 
  S: string; 
  ax: string;
  ap: number;
  as: number; 
  bx: string; 
  bp: number;
  bs: number;
  c: string[];
  t: string; 
  z: string; 
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

export interface AlpacaAsset {
  id: string;
  class: string; 
  exchange: string; 
  symbol: string; 
  name: string; 
  status: string;
  tradable: boolean;
  marginable: boolean;
  maintenance_margin_requirement: number;
  shortable: boolean;
  easy_to_borrow: boolean;
  fractionable: boolean;
  attributes: string[];
}

export interface AlpacaSnapshotData {
  latestTrade: {
    t: string; 
    x: string; 
    p: number; 
    s: number; 
    c: string[]; 
    i: number; 
    z: string; 
  };
  latestQuote: {
    t: string; 
    ax: string; 
    ap: number; 
    as: number; 
    bx: string; 
    bp: number; 
    bs: number; 
    c: string[]; 
    z: string; 
  };
  minuteBar: {
    t: string; 
    o: number; 
    h: number; 
    l: number; 
    c: number;
    v: number; 
    n: number; 
    vw: number;
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