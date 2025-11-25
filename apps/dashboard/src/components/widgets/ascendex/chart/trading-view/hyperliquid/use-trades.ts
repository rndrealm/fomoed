import { useEffect, useState, useRef, useCallback } from "react";
import { subscribeToTrades, unsubscribeFromTrades } from "./streaming";
import { WsTrade } from "./types";

export function useTrades(coin?: string) {
  const [trades, setTrades] = useState<WsTrade[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef<((data: WsTrade[]) => void) | null>(null);
  const subscribedRef = useRef(false);

  const handleTradeUpdate = useCallback((data: WsTrade[]) => {
    // Using functional state update to ensure we don't need 'trades' as a dependency

    const reversedData = data.reverse();
    setTrades((prev) => [...reversedData, ...prev].slice(0, 100));
    setIsConnected(true);
  }, []);

  useEffect(() => {
    if (!coin || subscribedRef.current) return;
    subscribedRef.current = true;

    callbackRef.current = handleTradeUpdate;
    subscribeToTrades(coin, handleTradeUpdate);

    return () => {
      if (callbackRef.current) {
        unsubscribeFromTrades(coin, callbackRef.current);
        setTrades([]);
        setIsConnected(false);
      }
      subscribedRef.current = false;
    };
  }, [coin, handleTradeUpdate]);

  return {
    isConnected,
    trades,
  };
}
