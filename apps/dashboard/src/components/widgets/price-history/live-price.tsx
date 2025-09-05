import { geoLocationAtom } from "@/lib/atoms/geoLocation";
import { formatPriceSignificant } from "@/lib/utils";
import { useFetchBinancePriceData, useFetchBinanceTokenPrice } from "@/services/queries/charts";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState, useMemo } from "react";

interface IProps {
  token?: string;
  period?: {
    label: string;
    value: string;
    binanceInterval: string;
  };
  selectedPeriod?: string;
}

export function LivePrice(props: IProps) {
  const { token = "", period, selectedPeriod } = props;

  const location = useAtomValue(geoLocationAtom);

  // Fetch real-time price for current price display
  const { data: price } = useFetchBinanceTokenPrice(token, location?.country);

  // Fetch historical data for percentage calculation
  const { data: historicalData = [] } = useFetchBinancePriceData(
    `${token}USDT`,
    period?.binanceInterval,
    1000,
    location?.country,
  );

  const hasLivePrice = useRef(false);
  const [tokenPrice, setTokenPrice] = useState("");
  const [percentChange, setPercentChange] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Filter historical data based on selected period
  const filteredHistoricalData = useMemo(() => {
    if (!historicalData.length || !selectedPeriod) return [];

    const now = new Date();
    let cutoffDate: Date;

    switch (selectedPeriod) {
      case "1D":
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case "1W":
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "1M":
        cutoffDate = new Date(now);
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "3M":
        cutoffDate = new Date(now);
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case "6M":
        cutoffDate = new Date(now);
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case "1Y":
        cutoffDate = new Date(now);
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case "YTD":
        cutoffDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return historicalData;
    }

    const cutoff = cutoffDate.getTime();
    return historicalData.filter((d) => (d.time as number) * 1000 >= cutoff);
  }, [historicalData, selectedPeriod]);

  // Calculate percentage change based on filtered historical data
  const calculatedPercentChange = useMemo(() => {
    if (!filteredHistoricalData.length || !tokenPrice) return 0;

    const currentPrice = parseFloat(tokenPrice);
    const startPrice = (filteredHistoricalData[0] as any)?.value || (filteredHistoricalData[0] as any)?.close;

    if (!startPrice || startPrice <= 0) return 0;

    return ((currentPrice - startPrice) / startPrice) * 100;
  }, [filteredHistoricalData, tokenPrice]);

  // Update percentage change when calculated value changes
  useEffect(() => {
    if (filteredHistoricalData.length > 0 && tokenPrice) {
      setPercentChange(calculatedPercentChange);
    }
  }, [calculatedPercentChange, filteredHistoricalData, tokenPrice]);

  const handleTickerUpdate = (stream: string, data: any) => {
    if (!stream || !data) return;

    if (stream.endsWith("@trade")) {
      setTokenPrice(data.p);
      hasLivePrice.current = true;
    }

    // Remove the miniTicker percentage calculation since we'll use our own
    if (stream.endsWith("@miniTicker")) {
      if (!hasLivePrice.current) {
        setTokenPrice(data.c);
      }
    }
  };

  useEffect(() => {
    if (!token || !location?.country) return;

    setTokenPrice("");
    setPercentChange(0);
    hasLivePrice.current = false;

    const connectEventSourceProxy = () => {
      console.log("Primary Ticker WebSocket failed. Attempting fallback to EventSource proxy...");
      const eventSource = new EventSource(`https://binance.fomoed.io/stream?token=${token}&streamType=ticker`);
      // const eventSource = new EventSource(`/api/websocket-proxy?token=${token}&streamType=ticker`);
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
        eventSource.close();
      };
    };

    const connectWebSocket = () => {
      const lowerToken = token.toLowerCase();
      const streams = `${lowerToken}usdt@trade/${lowerToken}usdt@miniTicker`;
      const endpoint =
        location.country === "US"
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

  // Fallback to API data if no live price
  useEffect(() => {
    if (price?.lastPrice && !hasLivePrice.current) {
      setTokenPrice(price?.lastPrice);
      // Don't use API percentage change anymore
    }
  }, [price]);

  useEffect(() => {
    hasLivePrice.current = false;
  }, [token]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <h2 className="text-xl sm:text-2xl text-white leading-[1.35] font-bold">
          <span className="text-[#AFAFAF] text-xl">$</span>
          {tokenPrice ? formatPriceSignificant(tokenPrice) : "..."}
        </h2>
        <p
          className={`text-[13px] leading-[1.25] font-medium ${
            percentChange >= 0 ? "text-[#00AF58]" : "text-[#FF8970]"
          }`}
        >
          {`${percentChange > 0 ? "+" : ""}` + percentChange.toFixed(2) + "%"}
        </p>
      </div>
    </div>
  );
}
