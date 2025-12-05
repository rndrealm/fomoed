import { useEffect, useState, useRef, useCallback } from "react";
import { subscribeToSpotState, unsubscribeFromSpotState } from "./streaming";
import { WsSpotState } from "./types";

export function useSpotState(address?: string) {
  const [spotState, setSpotState] = useState<WsSpotState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef<((data: WsSpotState) => void) | null>(null);
  const subscribedRef = useRef(false);

  const handleSpotStateUpdate = useCallback((data: any) => {
    setSpotState(data);
    setIsConnected(true);
  }, []);

  useEffect(() => {
    if (!address || subscribedRef.current) return;
    subscribedRef.current = true;

    callbackRef.current = handleSpotStateUpdate;
    subscribeToSpotState(address, handleSpotStateUpdate);

    return () => {
      if (callbackRef.current) {
        unsubscribeFromSpotState(address, callbackRef.current);
        setSpotState(null);
        setIsConnected(false);
      }
      subscribedRef.current = false;
    };
  }, [address, handleSpotStateUpdate]);

  return {
    isConnected,
    spotState,
  };
}
