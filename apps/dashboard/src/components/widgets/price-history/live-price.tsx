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
    // if (!location?.country) return;
    setTokenPrice("");
    setPercentChange(0);

    // Create EventSource for Server-Sent Events instead of WebSocket
    const eventSource = new EventSource(
      `/api/websocket-proxy?token=${token}&country=${location?.country || "global"}&streamType=ticker`,
    );

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const stream = message.stream; // e.g., "btcusdt@trade"
        const data = message.data;

        if (stream.endsWith("@trade")) {
          setTokenPrice(data.p);
          hasLivePrice.current = true;
        }

        if (stream.endsWith("@miniTicker")) {
          const current = parseFloat(data.c); // close price
          const open = parseFloat(data.o); // open price
          const change = ((current - open) / open) * 100;

          setPercentChange(change);
          hasLivePrice.current = true;
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
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
