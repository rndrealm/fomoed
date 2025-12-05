import { useEffect, useState, useRef, useCallback } from "react";
import { subscribeToOpenOrders, unsubscribeFromOpenOrders } from "./streaming";
import { WsOpenOrders } from "./types";

export function useOpenOrders(address?: string) {
  const [openOrders, setOpenOrders] = useState<WsOpenOrders | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef<((data: WsOpenOrders) => void) | null>(null);
  const subscribedRef = useRef(false);

  const handleClearingHouseUpdate = useCallback((data: WsOpenOrders) => {
    // console.log(data);

    setOpenOrders(data);
    setIsConnected(true);
  }, []);

  useEffect(() => {
    if (!address || subscribedRef.current) return;
    subscribedRef.current = true;

    callbackRef.current = handleClearingHouseUpdate;
    subscribeToOpenOrders(address, handleClearingHouseUpdate);

    return () => {
      if (callbackRef.current) {
        unsubscribeFromOpenOrders(address, callbackRef.current);
        setOpenOrders(null);
        setIsConnected(false);
      }
      subscribedRef.current = false;
    };
  }, [address, handleClearingHouseUpdate]);

  return {
    isConnected,
    openOrders,
  };
}
