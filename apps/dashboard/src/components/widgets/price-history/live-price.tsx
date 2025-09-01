import { geoLocationAtom } from "@/lib/atoms/geoLocation";
import { formatPriceSignificant } from "@/lib/utils";
import { useFetchBinancePriceData, useFetchBinanceTokenPrice } from "@/services/queries/charts";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";

interface IProps {
  token?: string;
  period?: string;
}

export function LivePrice(props: IProps) {
  const { token = "" } = props;

  const location = useAtomValue(geoLocationAtom);

  const { data: price } = useFetchBinanceTokenPrice(token, location?.country);

  const hasLivePrice = useRef(false);
  const [tokenPrice, setTokenPrice] = useState("");
  const [percentChange, setPercentChange] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!token || !location?.country) return;

    setTokenPrice("");
    setPercentChange(0);
    hasLivePrice.current = false;


    const handleTickerUpdate = (stream: string, data: any) => {
        if (!stream || !data) return;

        if (stream.endsWith("@trade")) {
            setTokenPrice(data.p);
            hasLivePrice.current = true;
        }

        if (stream.endsWith("@miniTicker")) {
            const current = parseFloat(data.c); 
            const open = parseFloat(data.o);    
            if (open > 0) { 
                const change = ((current - open) / open) * 100;
                setPercentChange(change);
            }
            

            if (!hasLivePrice.current) {
                setTokenPrice(data.c);
            }
        }
    };

    const connectEventSourceProxy = () => {
        console.log("Primary Ticker WebSocket failed. Attempting fallback to EventSource proxy...");
        const eventSource = new EventSource(`/api/websocket-proxy?token=${token}&streamType=ticker`);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type !== "heartbeat") {
                    handleTickerUpdate(message.stream, message.data);
                }
            } catch (error) {
                console.error("Error parsing ticker fallback message:", error);
            }
        };

        eventSource.onerror = (error) => {
            // console.error("Ticker EventSource fallback also failed:", error);
            eventSource.close();
        };
    };

    const connectWebSocket = () => {
        const lowerToken = token.toLowerCase();
        const streams = `${lowerToken}usdt@trade/${lowerToken}usdt@miniTicker`;
        const endpoint = location.country === "US"
            ? `wss://stream.binance.us:9443/stream?streams=${streams}`
            : `wss://stream.binance.com:9443/stream?streams=${streams}`;

        const ws = new WebSocket(endpoint);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log(`Direct Ticker WebSocket connection established for ${token}. ✅`);
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.stream && message.data) {
                    handleTickerUpdate(message.stream, message.data);
                }
            } catch (error) {
                console.error("Error parsing ticker WebSocket message:", error);
            }
        };

        ws.onerror = (error) => {
            // console.error("Direct Ticker WebSocket connection error:", error);
            ws.close();
            connectEventSourceProxy();
        };
    };

    connectWebSocket();

    return () => {
        if (wsRef.current) {
            wsRef.current.close();
        }
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }
    };
}, [token, location?.country]);

  useEffect(() => {
    if (price?.lastPrice && !hasLivePrice.current) {
      setTokenPrice(price?.lastPrice);
      setPercentChange(Number(price?.priceChangePercent));
    }
  }, [price]);

  useEffect(() => {
    hasLivePrice.current = false;
  }, [token]);

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-[#C3C3C3] text-[15px] leading-[1.25] font-medium">Price</h3>
      <div className="flex items-center gap-2">
        <h2 className="text-xl sm:text-2xl text-white leading-[1.35] font-bold">
          <span className="text-[#AFAFAF] text-xl">$</span>
          {tokenPrice ? formatPriceSignificant(tokenPrice) : "..."}
        </h2>
        <p className="text-[13px] text-[#C3C3C3] leading-[1.25] font-medium">
          {`${percentChange > 0 ? "+" : ""}` + percentChange.toFixed(2) + "%"}
        </p>
      </div>
    </div>
  );
}
