import { useEffect, useState, useRef } from "react";
import { subscribeToOrderBook, unsubscribeFromOrderBook } from "./streaming";

export interface OrderBookLevel {
  px: string;
  sz: string;
  n: number;
}

interface OrderBookData {
  coin: string;
  levels: [OrderBookLevel[], OrderBookLevel[]];
  time: number;
}

export function useOrderBook(coin?: string) {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef<((data: any) => void) | null>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!coin) return;

    const handleOrderBookUpdate = (data: any) => {
      setOrderBook(data);
      setIsConnected(true);
    };

    callbackRef.current = handleOrderBookUpdate;
    subscribeToOrderBook(coin, handleOrderBookUpdate);
    isSubscribedRef.current = true;

    return () => {
      if (callbackRef.current && isSubscribedRef.current) {
        unsubscribeFromOrderBook(coin, callbackRef.current);
        isSubscribedRef.current = false;
      }
    };
  }, [coin]);

  const bids = orderBook?.levels[0] || [];
  const asks = orderBook?.levels[1] || [];

  const maxBidVolume = Math.max(...bids.map((bid) => parseFloat(bid.sz)));
  const maxAskVolume = Math.max(...asks.map((ask) => parseFloat(ask.sz)));

  return {
    bids,
    asks,
    orderBook,
    isConnected,
    maxBidVolume,
    maxAskVolume,
  };
}
