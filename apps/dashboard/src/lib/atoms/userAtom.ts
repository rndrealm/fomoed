import { atom } from "jotai";
import type { User } from "@supabase/supabase-js";
import type { PublicUserDataRow } from "@/lib/types/db.types";
import { layoutAtom } from "./layoutAtom";
import { activeTabAtom, initialTab, tabsAtom } from "./tabsAtom";
import { initialSetting, settingAtom } from "./settingsAtom";

export const authUserAtom = atom<User | null>(null);
export const publicUserDataAtom = atom<PublicUserDataRow | null>(null);
export const isLoadingUserAtom = atom<boolean>(true);

// Add a reset action to your atoms
export const resetAuthState = atom(null, (get, set) => {
  set(authUserAtom, null);
  set(publicUserDataAtom, null);
  set(layoutAtom, []);
  set(tabsAtom, []);
  set(settingAtom, initialSetting);
  set(activeTabAtom, initialTab);
  // Reset any other auth-related atoms
});
