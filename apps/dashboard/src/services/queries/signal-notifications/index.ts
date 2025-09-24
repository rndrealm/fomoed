import useUserData from "@/lib/hooks/use-user-data";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export interface NotificationRow {
  id: string;
  created_at: string;
  user_id: string;
  description: string;
  smart_signal_id: number;
  read: boolean;
  signal_name: string;
}

export const useSignalNotifications = () => {
  const { data: userData, isLoading, error } = useUserData();
  const queryClient = useQueryClient();

  const query = useQuery<NotificationRow[]>({
    queryKey: ["signal-notifications", userData?.user_id],
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          *,
          smart_signals:smart_signal_id (
            name
          )
        `,
        )
        .eq("user_id", userData!.user_id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error("Failed to fetch notifications");
      }

      return (data || []).map((notification) => ({
        ...notification,
        read: notification.read ?? false,
        signal_name: notification.smart_signals?.name || "Unnamed Signal",
      }));
    },
    enabled: !!userData?.user_id,
  });

  useEffect(() => {
    if (!userData?.user_id) return;

    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userData.user_id}`,
        },
        (payload) => {
          // Refetch or update cache with new notification
          queryClient.invalidateQueries({
            queryKey: ["signal-notifications", userData.user_id],
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userData?.user_id, queryClient]);

  return query;
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const supabase = createSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase.rpc("mark_notification_as_read", {
        notification_id: notificationId,
      });

      if (error) {
        throw new Error("Failed to mark notification as read");
      }
    },
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["signal-notifications"] });
    },
  });
};
