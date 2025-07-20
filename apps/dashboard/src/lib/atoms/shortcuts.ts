import { atom } from "jotai";

export const spotlightVisibleAtom = atom(false);
export const quickWidgetsVisibleAtom = atom(false);

export const toggleSpotlightAtom = atom(null, (get, set, value?: boolean) => {
  if (typeof value === "boolean") {
    set(spotlightVisibleAtom, value);
  } else {
    set(spotlightVisibleAtom, (prev) => !prev);
  }
});

export const toggleQuickWidgetsAtom = atom(
  null,
  (get, set, value?: boolean) => {
    if (typeof value === "boolean") {
      set(quickWidgetsVisibleAtom, value);
    } else {
      set(quickWidgetsVisibleAtom, (prev) => !prev);
    }
  }
);
