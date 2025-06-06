import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import useSession from "@/lib/hooks/use-session";
import { useCallback, useEffect } from "react";
import { atom, useAtom } from "jotai";

type NotificationRow = {
    id: string; // uuid
    created_at: string; // ISO timestamp
    user_id: string; // uuid
    description: string;
    smart_signal_id: number;
};

export const notificationsAtom = atom<NotificationRow[]>([]);

export function useNotifications() {
    const session = useSession();
    const [notifications, setNotifications] = useAtom(notificationsAtom);

    const fetchNotifications = useCallback(async () => {
        const userId = session?.user?.id;
        if (!userId) {
            setNotifications([]);
            return;
        }
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
        if (!error && data) {
            setNotifications(data as NotificationRow[]);
        }
    }, [session, setNotifications]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Add a function to delete a notification by id
    const deleteNotification = async (id: string) => {
        const supabase = createSupabaseBrowserClient();
        await supabase.from("notifications").delete().eq("id", id);
        // Optionally, refetch notifications after deletion
        // fetchNotifications();
    };

    return { notifications, fetchNotifications, deleteNotification };
}
