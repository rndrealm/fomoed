import { useEffect, useState, useRef, useCallback } from "react";
import { subscribeToClearingHouse, unsubscribeFromClearingHouse } from "./streaming";
import { WsClearingHouseState } from "./types";

export function useClearingHouseState(address?: string) {
  const [clearingHouse, setClearingHouse] = useState<WsClearingHouseState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef<((data: WsClearingHouseState) => void) | null>(null);
  const subscribedRef = useRef(false);

  const handleClearingHouseUpdate = useCallback((data: WsClearingHouseState) => {
    // console.log(data);

    setClearingHouse(data);
    setIsConnected(true);
  }, []);

  useEffect(() => {
    if (!address || subscribedRef.current) return;
    subscribedRef.current = true;

    callbackRef.current = handleClearingHouseUpdate;
    subscribeToClearingHouse(address, handleClearingHouseUpdate);

    return () => {
      if (callbackRef.current) {
        unsubscribeFromClearingHouse(address, callbackRef.current);
        setClearingHouse(null);
        setIsConnected(false);
      }
      subscribedRef.current = false;
    };
  }, [address, handleClearingHouseUpdate]);

  return {
    isConnected,
    clearingHouse,
  };
}
