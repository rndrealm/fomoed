import { atom } from "jotai";
import { PerpUniverse, SpotsUniverse } from "@/services/queries/hyperliquid/types";

export const selectedTokenAtom = atom<PerpUniverse | SpotsUniverse | null>(null);

export const showSelectTokenModalAtom = atom(false);

export const toggleSelectTokenModalAtom = atom(null, (get, set, value?: boolean) => {
  if (typeof value === "boolean") {
    set(showSelectTokenModalAtom, value);
  } else {
    set(showSelectTokenModalAtom, (prev) => !prev);
  }
});
