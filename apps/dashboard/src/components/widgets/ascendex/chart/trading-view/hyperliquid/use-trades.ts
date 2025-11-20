import { useEffect, useState, useRef } from "react";
import { subscribeToTrades, unsubscribeFromTrades } from "./streaming";
import { WsTrade } from "./types";

export function useTrades(coin?: string) {
  const [trades, setTrades] = useState<WsTrade[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef<((data: WsTrade[]) => void) | null>(null);

  useEffect(() => {
    if (!coin) return;

    const handleTradeUpdate = (data: WsTrade[]) => {
      setTrades((prev) => [...data.reverse(), ...prev].slice(0, 50));
      setIsConnected(true);
    };

    callbackRef.current = handleTradeUpdate;
    subscribeToTrades(coin, handleTradeUpdate);

    return () => {
      if (callbackRef.current) {
        unsubscribeFromTrades(coin, callbackRef.current);
        setTrades([]);
        setIsConnected(false);
      }
    };
  }, [coin]);

  return {
    isConnected,
    trades,
  };
}
