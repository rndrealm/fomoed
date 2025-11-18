import { atom } from "jotai";

export const tradingPair = atom("ETH/USDC");
export const tradingActiveSymbol = atom("ETH");

export const setTradingActiveSymbolAtom = atom(null, (get, set, newSymbol: string) => {
  set(tradingActiveSymbol, newSymbol);
});
