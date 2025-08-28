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

  useEffect(() => {
  setTokenPrice("");
  setPercentChange(0);

  let eventSource: EventSource | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let isComponentMounted = true;

  const connect = () => {
    if (!isComponentMounted) return;

    eventSource = new EventSource(`/api/websocket-proxy?token=${token}&streamType=ticker`);

    eventSource.onopen = () => {
      // console.log("Ticker SSE connection opened");
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // Skip heartbeat messages
        if (message.type === "heartbeat") {
          return;
        }

        // For multi-stream, data comes wrapped in stream/data format
        const stream = message.stream;
        const data = message.data;

        if (!stream || !data) {
          // console.log("No stream or data found:", message);
          return;
        }

        // console.log("Received stream:", stream, "Data:", data);

        // Handle trade stream for real-time price
        if (stream?.endsWith("@trade")) {
          setTokenPrice(data.p);
          hasLivePrice.current = true;
          // console.log("Updated price from trade:", data.p);
        }

        // Handle miniTicker stream for percentage change
        if (stream?.endsWith("@miniTicker")) {
          const current = parseFloat(data.c); // close price
          const open = parseFloat(data.o); // open price
          const change = ((current - open) / open) * 100;

          setPercentChange(change);
          hasLivePrice.current = true;
          // console.log("Updated percentage change from miniTicker:", change.toFixed(2) + "%");

          // Also update price from miniTicker if no trade data yet
          if (!hasLivePrice.current) {
            setTokenPrice(data.c);
          }
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error, "Raw data:", event.data);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Ticker EventSource error:", error);

      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }

      if (isComponentMounted && !reconnectTimeout) {
        reconnectTimeout = setTimeout(() => {
          if (isComponentMounted) {
            console.log("Attempting to reconnect ticker...");
            connect();
          }
        }, 3000);
      }
    };
  };

  connect();

  return () => {
    isComponentMounted = false;

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }

    if (eventSource) {
      eventSource.close();
    }
  };
}, [token]);

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
