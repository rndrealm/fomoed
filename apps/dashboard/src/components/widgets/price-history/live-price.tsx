import { formatPriceSignificant } from "@/lib/utils";
import { useEffect, useState } from "react";

interface IProps {
  token?: string;
}

export function LivePrice(props: IProps) {
  const { token = "btc" } = props;

  const [tokenPrice, setTokenPrice] = useState("");
  const [percentChange, setPercentChange] = useState(0);

  useEffect(() => {
    setTokenPrice("");
    setPercentChange(0);
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/stream?streams=${token.toLowerCase()}usdt@trade/${token.toLowerCase()}usdt@miniTicker`
    );

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const stream = message.stream; // e.g., "btcusdt@trade"
      const data = message.data;

      if (stream.endsWith("@trade")) {
        setTokenPrice(data.p);
      }

      if (stream.endsWith("@miniTicker")) {
        const current = parseFloat(data.c); // close price
        const open = parseFloat(data.o); // open price
        const change = ((current - open) / open) * 100;

        setPercentChange(change);
      }
    };

    return () => ws.close();
  }, [token]);

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-[#C3C3C3] text-[15px] leading-[1.25] font-medium">
        Price
      </h3>
      <div className="flex items-center gap-2">
        <h2 className="text-2xl text-white leading-[1.35] font-bold">
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
