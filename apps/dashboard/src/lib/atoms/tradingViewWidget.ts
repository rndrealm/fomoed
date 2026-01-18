import { atom } from "jotai";
import { PerpUniverse, SpotsUniverse } from "@/services/queries/hyperliquid/types";

export type AssetType = "crypto" | "stock";

export interface StockSymbol {
  symbol: string;
  name: string;
  displayName: string;
  type: "stock";
  exchange: string;
  price: string;
  sector?: string;
  baseTokenName?: string;
  quoteTokenName?: string;
}

export type UnifiedSymbol = (PerpUniverse | SpotsUniverse | StockSymbol) & {
  type?: AssetType;
};

export const selectedTokenAtom = atom<UnifiedSymbol | null>(null);

export const showSelectTokenModalAtom = atom(false);

export const toggleSelectTokenModalAtom = atom(null, (get, set, value?: boolean) => {
  if (typeof value === "boolean") {
    set(showSelectTokenModalAtom, value);
  } else {
    set(showSelectTokenModalAtom, (prev) => !prev);
  }
});

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const setToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
  }
};

const selectedTokenWidgetBaseAtom = atom<UnifiedSymbol | null>(
  getFromStorage("selectedTokenWidget", null)
);

export const selectedTokenAtomWidgets = atom(
  (get) => get(selectedTokenWidgetBaseAtom),
  (get, set, newValue: UnifiedSymbol | null) => {
    set(selectedTokenWidgetBaseAtom, newValue);
    setToStorage("selectedTokenWidget", newValue);
  }
);

const tokenSearchBaseAtom = atom<string>(getFromStorage("tokenSearchValue", ""));

export const tokenSearchValueAtom = atom(
  (get) => get(tokenSearchBaseAtom),
  (get, set, newValue: string) => {
    set(tokenSearchBaseAtom, newValue);
    setToStorage("tokenSearchValue", newValue);
  }
);

const tokenCategoryBaseAtom = atom<string>(getFromStorage("tokenActiveCategory", "crypto"));

export const tokenActiveCategoryAtom = atom(
  (get) => get(tokenCategoryBaseAtom),
  (get, set, newValue: string) => {
    set(tokenCategoryBaseAtom, newValue);
    setToStorage("tokenActiveCategory", newValue);
  }
);

const assetTypeBaseAtom = atom<AssetType | "all">(getFromStorage("assetType", "all"));

export const assetTypeAtom = atom(
  (get) => get(assetTypeBaseAtom),
  (get, set, newValue: AssetType | "all") => {
    set(assetTypeBaseAtom, newValue);
    setToStorage("assetType", newValue);
  }
);