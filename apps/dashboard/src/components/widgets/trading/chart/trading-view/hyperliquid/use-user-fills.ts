import { useEffect, useState, useRef, useCallback } from "react";
import { subscribeToUserFills, unsubscribeFromUserFills } from "./streaming";
import { WsUserFills } from "./types";

export function useUserFills(address?: string) {
  const [userFills, setUserFills] = useState<WsUserFills[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef<((data: WsUserFills[]) => void) | null>(null);
  const subscribedRef = useRef(false);

  const handleUserFillsUpdate = useCallback((data: WsUserFills[]) => {
    // console.log(data);

    setUserFills(data);
    setIsConnected(true);
  }, []);

  useEffect(() => {
    if (!address || subscribedRef.current) return;
    subscribedRef.current = true;

    callbackRef.current = handleUserFillsUpdate;
    subscribeToUserFills(address, handleUserFillsUpdate);

    return () => {
      if (callbackRef.current) {
        unsubscribeFromUserFills(address, callbackRef.current);
        setUserFills([]);
        setIsConnected(false);
      }
      subscribedRef.current = false;
    };
  }, [address, handleUserFillsUpdate]);

  return {
    isConnected,
    userFills,
  };
}
