import { useEffect, useState, useRef, useCallback } from "react";
import { subscribeToTicker, unsubscribeFromTicker } from "./streaming";
import { WsActiveAssetCtx, WsActiveSpotAssetCtx } from "./types";

export function useTicker(coin?: string) {
  const [ticker, setTicker] = useState<WsActiveAssetCtx | WsActiveSpotAssetCtx | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef<((data: WsActiveAssetCtx | WsActiveSpotAssetCtx) => void) | null>(null);
  const subscribedRef = useRef(false);

  const handleTickUpdate = useCallback((data: WsActiveAssetCtx | WsActiveSpotAssetCtx) => {
    setTicker(data);
    setIsConnected(true);
  }, []);

  useEffect(() => {
    if (!coin || subscribedRef.current) return;
    subscribedRef.current = true;

    callbackRef.current = handleTickUpdate;
    subscribeToTicker(coin, handleTickUpdate);

    return () => {
      if (callbackRef.current) {
        unsubscribeFromTicker(coin, callbackRef.current);
        setTicker(null);
        setIsConnected(false);
      }
      subscribedRef.current = false;
    };
  }, [coin, handleTickUpdate]);

  return {
    isConnected,
    ticker,
  };
}
