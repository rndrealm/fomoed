import { atom } from "jotai";
import { CopyTrade } from "@/services/queries/gemach/types";

export const showHowItWorksAtom = atom(false);
export const showFundGdexAtom = atom(false);
export const showWithdrawAtom = atom(false);
export const showCreateCopyTradeAtom = atom(false);
export const showEditCopyTradeAtom = atom(false);

export const copyTradeTraderWalletAtom = atom("");

export const gemachUserLoggedInAtom = atom(false);

export const singleCopyTradeAtom = atom(null as null | CopyTrade);

export const toggleHowItWorksAtom = atom(null, (get, set, value?: boolean) => {
  if (typeof value === "boolean") {
    set(showHowItWorksAtom, value);
  } else {
    set(showHowItWorksAtom, (prev) => !prev);
  }
});

export const toggleShowFundGdexAtom = atom(null, (get, set, value?: boolean) => {
  if (typeof value === "boolean") {
    set(showFundGdexAtom, value);
  } else {
    set(showFundGdexAtom, (prev) => !prev);
  }
});

export const toggleGemachUserLoggedInAtom = atom(null, (get, set, value?: boolean) => {
  if (typeof value === "boolean") {
    set(gemachUserLoggedInAtom, value);
  } else {
    set(gemachUserLoggedInAtom, (prev) => !prev);
  }
});

export const toggleWithdrawAtom = atom(null, (get, set, value?: boolean) => {
  if (typeof value === "boolean") {
    set(showWithdrawAtom, value);
  } else {
    set(showWithdrawAtom, (prev) => !prev);
  }
});

export const toggleCreateCopyTradeAtom = atom(null, (get, set, value?: boolean) => {
  if (typeof value === "boolean") {
    set(showCreateCopyTradeAtom, value);
  } else {
    set(showCreateCopyTradeAtom, (prev) => !prev);
  }
});

export const toggleEditCopyTradeAtom = atom(null, (get, set, value?: boolean) => {
  if (typeof value === "boolean") {
    set(showEditCopyTradeAtom, value);
  } else {
    set(showEditCopyTradeAtom, (prev) => !prev);
  }
});
