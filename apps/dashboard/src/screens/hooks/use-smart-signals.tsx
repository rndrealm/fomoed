import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { ConditionObject } from "../types";
import useUserData from "@/lib/hooks/use-user-data"; // import the hook
import { useCallback, useEffect } from "react";
import { atom, useAtom } from "jotai";

// Atom to hold the smart signals globally
export const smartSignalsAtom = atom<SmartSignalRow[]>([]);

export interface SmartSignalRow {
    id: number | null;
    created_at: string;
    user_id: number;
    updated_at: string;
    topics: string[];
    condition: string;
    fired_at: string | null;
    actions: any[];
}

function getTopicsFromCondition(condition: ConditionObject): string[] {
    const topics: string[] = [];

    function extract(obj: any) {
        if (typeof obj !== "object" || obj === null) return;

        // Handle logical conditions (and/or)
        if (obj.and || obj.or) {
            const arr = obj.and || obj.or;
            if (Array.isArray(arr)) {
                arr.forEach(extract);
            }
        }

        // Handle comparison conditions
        for (const key of Object.keys(obj)) {
            if (["<", ">", "<=", ">=", "="].includes(key)) {
                const operands = obj[key];
                if (Array.isArray(operands)) {
                    operands.forEach(extract);
                }
            }
        }

        // Handle topic object
        if (obj.topic && Array.isArray(obj.topic) && typeof obj.topic[0] === "string") {
            topics.push(obj.topic[0]);
        }
    }

    extract(condition);
    return topics;
}

export function useSmartSignals() {
    const userData = useUserData();
    const [smartSignals, setSmartSignals] = useAtom(smartSignalsAtom);

    const refreshSmartSignals = useCallback(async () => {
        if (!userData) {
            setSmartSignals([]);
            return;
        }
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.from("smart_signals").select("*").eq("user_id", userData.id);
        if (!error && data) {
            setSmartSignals(data as SmartSignalRow[]);
        }
    }, [userData, setSmartSignals]);

    const saveSmartSignal = async (condition: ConditionObject): Promise<SmartSignalRow | null> => {
        if (!userData) {
            return null;
        }
        const topics = getTopicsFromCondition(condition);
        const smartSignal: Partial<SmartSignalRow> = {
            user_id: userData.id,
            topics,
            condition: JSON.stringify(condition),
            fired_at: null,
            actions: [{ type: "notification" }],
        };
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.from("smart_signals").insert([smartSignal]).select("*").single();
        if (!error) {
            await refreshSmartSignals();
        }
        return error ? null : (data as SmartSignalRow);
    };

    const deleteSmartSignal = async (id: number): Promise<boolean> => {
        if (!userData) {
            return false;
        }
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.from("smart_signals").delete().eq("id", id).eq("user_id", userData.id);
        if (!error) {
            await refreshSmartSignals();
        }
        return !error;
    };

    useEffect(() => {
        refreshSmartSignals();
    }, [refreshSmartSignals]);

    return { smartSignals, saveSmartSignal, deleteSmartSignal, refreshSmartSignals };
}
