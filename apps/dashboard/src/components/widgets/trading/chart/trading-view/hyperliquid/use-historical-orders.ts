import { useEffect, useState, useRef, useCallback } from "react";
import { subscribeToHistoricalOrders, unsubscribeFromHistoricalOrders } from "./streaming";
import { WsOrderHistory } from "./types";

export function useHistoricalOrders(address?: string) {
  const [orderHistory, setOrderHistory] = useState<WsOrderHistory[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef<((data: WsOrderHistory[]) => void) | null>(null);
  const subscribedRef = useRef(false);

  const handleOrderHistoryUpdate = useCallback((data: WsOrderHistory[]) => {
    // console.log(data);

    setOrderHistory((prev) => [...prev, ...data]);
    setIsConnected(true);
  }, []);

  useEffect(() => {
    if (!address || subscribedRef.current) return;
    subscribedRef.current = true;

    callbackRef.current = handleOrderHistoryUpdate;
    subscribeToHistoricalOrders(address, handleOrderHistoryUpdate);

    return () => {
      if (callbackRef.current) {
        unsubscribeFromHistoricalOrders(address, callbackRef.current);
        setOrderHistory([]);
        setIsConnected(false);
      }
      subscribedRef.current = false;
    };
  }, [address, handleOrderHistoryUpdate]);

  return {
    isConnected,
    orderHistory,
  };
}
