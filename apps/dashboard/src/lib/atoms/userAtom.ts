import { atom } from "jotai";
import type { User } from "@supabase/supabase-js";
import type { PublicUserDataRow } from "@/lib/types/db.types";

export const authUserAtom = atom<User | null>(null);
export const publicUserDataAtom = atom<PublicUserDataRow | null>(null);
export const isLoadingUserAtom = atom<boolean>(false);

// Add a reset action to your atoms
export const resetAuthState = atom(null, (get, set) => {
    set(authUserAtom, null);
    set(publicUserDataAtom, null);
    // Reset any other auth-related atoms
});
