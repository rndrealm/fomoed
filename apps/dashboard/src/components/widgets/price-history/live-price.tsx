import { geoLocationAtom } from "@/lib/atoms/geoLocation";
import { formatPriceSignificant } from "@/lib/utils";
import { getBinanceWsServerUrl, throwFailedToConnectBinanceWsError } from "@/lib/utils/binance-client.utils";
import { safeJsonParse } from "@/lib/utils/common.utils";
import { useFetchBinancePriceData, useFetchBinanceTokenPrice } from "@/services/queries/charts";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState, useMemo } from "react";

const logKey = "[NewPriceChart]:";

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

  // Filter historical data based on selected period
  const filteredHistoricalData = useMemo(() => {
    if (!historicalData.length || !selectedPeriod) return [];

    const now = new Date();
    let cutoffDate: Date;

    switch (selectedPeriod) {
      case "1D": {
        // For daily timeframe, use today's start (00:00)
        cutoffDate = new Date(now);
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      }
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

    // For daily timeframe, ensure we get the first price of the day (00:00)
    if (selectedPeriod === "1D") {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      // Find the closest data point to start of day
      const startOfDayData = filteredHistoricalData.find((d) => {
        const dataTime = new Date((d.time as number) * 1000);
        return dataTime >= startOfDay;
      });

      if (startOfDayData) {
        const startPrice = (startOfDayData as any)?.value || (startOfDayData as any)?.close;
        if (startPrice && startPrice > 0) {
          return ((currentPrice - startPrice) / startPrice) * 100;
        }
      }
    }

    // For other timeframes, use the first data point in the filtered data
    const startPrice = (filteredHistoricalData[0] as any)?.value || (filteredHistoricalData[0] as any)?.close;
    if (!startPrice || startPrice <= 0) return 0;

    return ((currentPrice - startPrice) / startPrice) * 100;
  }, [filteredHistoricalData, tokenPrice, selectedPeriod]);

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
    if (!token) {
      console.info(logKey, "token not set, not subscribing");
      return;
    }

    if (!location?.country) {
      console.info(logKey, "country not set, not subscribing");
      return;
    }

    setTokenPrice("");
    setPercentChange(0);
    hasLivePrice.current = false;

    function connectWebsocket(wsServerUrl: string, onError: () => void) {
      const lowerToken = token.toLowerCase();
      const streams = `${lowerToken}usdt@trade/${lowerToken}usdt@miniTicker`;
      const endpoint = wsServerUrl + `/stream?streams=${streams}`;

      const ws = new WebSocket(endpoint);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(logKey, "Estabilished connection to ws:", wsServerUrl);
      };

      ws.onmessage = (event) => {
        const msg = safeJsonParse<any>(event.data, null);

        if (msg && msg.stream && msg.data) {
          handleTickerUpdate(msg.stream, msg.data);
        }
      };

      ws.onerror = () => {
        ws.close();
        onError();
      };
    }

    connectWebsocket(getBinanceWsServerUrl("binance", location), () => {
      connectWebsocket(getBinanceWsServerUrl("proxy", location), () => {
        throwFailedToConnectBinanceWsError();
      });
    });

    return () => {
      wsRef.current?.close();
    };
  }, [token, location]);

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
        <h2 className="text-lg sm:text-2xl text-white leading-[1.35] font-bold">
          <span className="text-[#AFAFAF] text-xl">$</span>
          {tokenPrice ? formatPriceSignificant(tokenPrice) : "..."}
        </h2>
        <p
          className={`text-[10px] sm:text-[13px] leading-[1.25] font-medium ${
            percentChange >= 0 ? "text-[#00AF58]" : "text-[#FF8970]"
          }`}
        >
          {`${percentChange > 0 ? "+" : ""}` + percentChange.toFixed(2) + "%"}
        </p>
      </div>
    </div>
  );
}
