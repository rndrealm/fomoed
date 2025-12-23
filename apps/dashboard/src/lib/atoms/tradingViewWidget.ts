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


// Widget token atom with manual localStorage persistence
const selectedTokenWidgetBaseAtom = atom<PerpUniverse | SpotsUniverse | null>(
  getFromStorage("selectedTokenWidget", null)
);

export const selectedTokenAtomWidgets = atom(
  (get) => get(selectedTokenWidgetBaseAtom),
  (get, set, newValue: PerpUniverse | SpotsUniverse | null) => {
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

const tokenCategoryBaseAtom = atom<string>(getFromStorage("tokenActiveCategory", "all"));

export const tokenActiveCategoryAtom = atom(
  (get) => get(tokenCategoryBaseAtom),
  (get, set, newValue: string) => {
    set(tokenCategoryBaseAtom, newValue);
    setToStorage("tokenActiveCategory", newValue);
  }
);