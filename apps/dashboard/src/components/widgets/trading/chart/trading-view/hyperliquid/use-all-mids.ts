import { useEffect, useState, useRef, useCallback } from "react";
import { subscribeToAllMids, unsubscribeFromAllMids } from "./streaming";
import { WsAllMids } from "./types";

export function useAllMids() {
  const [allMids, setAllMids] = useState<WsAllMids | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef<((data: WsAllMids) => void) | null>(null);
  const subscribedRef = useRef(false);

  const handleAllMidsUpdate = useCallback((data: WsAllMids) => {
    // console.log(data);

    setAllMids(data);
    setIsConnected(true);
  }, []);

  useEffect(() => {
    if (subscribedRef.current) return;
    subscribedRef.current = true;

    callbackRef.current = handleAllMidsUpdate;
    subscribeToAllMids(handleAllMidsUpdate);

    return () => {
      if (callbackRef.current) {
        unsubscribeFromAllMids(callbackRef.current);
        setAllMids(null);
        setIsConnected(false);
      }
      subscribedRef.current = false;
    };
  }, [handleAllMidsUpdate]);

  return {
    isConnected,
    allMids,
  };
}
