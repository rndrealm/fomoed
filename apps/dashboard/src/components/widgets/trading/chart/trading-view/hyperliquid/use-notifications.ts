import { useEffect, useState, useRef, useCallback } from "react";
import { subscribeToNotifications, unsubscribeFromNotifications } from "./streaming";
import { WsAllMids } from "./types";

export function useNotifications(address?: string) {
  const [notification, setNotification] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef<((data: string) => void) | null>(null);
  const subscribedRef = useRef(false);

  const handleNotificationUpdate = useCallback((data: string) => {
    // console.log(data);

    setNotification(data);
    setIsConnected(true);
  }, []);

  useEffect(() => {
    if (!address || subscribedRef.current) return;
    subscribedRef.current = true;

    callbackRef.current = handleNotificationUpdate;
    subscribeToNotifications(address, handleNotificationUpdate);

    return () => {
      if (callbackRef.current) {
        unsubscribeFromNotifications(address, callbackRef.current);
        setNotification("");
        setIsConnected(false);
      }
      subscribedRef.current = false;
    };
  }, [handleNotificationUpdate]);

  return {
    isConnected,
    notification,
  };
}
