export interface HyperLiquidKline {
  t: number;
  T: number;
  s: string;
  i: string;
  o: string;
  c: string;
  h: string;
  l: string;
  v: string;
  n: number;
}

export interface HyperLiquidSymbol {
  baseTokenName: string;
  quoteTokenName: string;
  price: string;
  isSpot: boolean;
  name: string;
}
