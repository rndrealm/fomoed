import { useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/utils/supabase/browser-client';
import { toast } from 'sonner';
import useUserData from './use-user-data';
import React from 'react';

export const useNotificationSubscription = () => {
  const userData = useUserData();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (!userData?.user_id) {
      console.log("No user ID available, skipping subscription");
      return;
    }

    console.log("Setting up subscription for user:", userData.user_id);

    // Subscribe to notification inserts only
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Only listen to INSERT events
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userData.user_id}`,
        },
        async (payload) => {
 
          try {
            // Fetch the signal name for the notification
            const { data: signalData, error } = await supabase
              .from('smart_signals')
              .select('name')
              .eq('id', payload.new.smart_signal_id)
              .single();

            if (error) {
              console.error("Error fetching signal name:", error);
              return;
            }

            const signalName = signalData?.name || 'Unnamed Signal';

            // Show toast with notification details
            toast(`Signal "${signalName}" has been triggered`, {
              description: payload.new.description,
              duration: 5000,
            });
          } catch (error) {
            console.error("Error processing notification:", error);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to notifications");
        } else if (status === 'CLOSED') {
          console.log("Subscription closed");
        } else if (status === 'CHANNEL_ERROR') {
          console.error("Channel error occurred");
        }
      });

    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [userData?.user_id, supabase]);
}; 