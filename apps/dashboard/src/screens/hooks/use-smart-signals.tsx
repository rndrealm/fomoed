import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { ConditionObject } from "../types";
import useUserData from "@/lib/hooks/use-user-data"; // import the hook

export interface SmartSignal {
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

    const saveSmartSignal = async (condition: ConditionObject): Promise<SmartSignal | null> => {
        if (!userData) {
            console.error("User data is not available");
            return null;
        }

        const topics = getTopicsFromCondition(condition);

        const smartSignal: Partial<SmartSignal> = {
            user_id: userData.id,
            topics,
            condition: JSON.stringify(condition),
            fired_at: null,
            actions: [{ type: "notification" }],
        };

        const supabase = createSupabaseBrowserClient();

        const { data, error } = await supabase.from("smart_signals").insert([smartSignal]).select("*").single();

        if (error) {
            console.error("Error saving smart signal:", error);
            return null;
        }

        return data as SmartSignal;
    };

    return { saveSmartSignal };
}
