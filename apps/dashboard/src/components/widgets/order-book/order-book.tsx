"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { OptionsDropdown } from "../shared/options-dropwdown";
import { CoinStats, Question } from "@/components/icons/icons";
import { cn, formatPriceSignificant } from "@/lib/utils";

type IOrder = [string, string]; // [price, quantity]

interface IOrderWithWidth {
  price: string;
  quantity: string;
  width: number; // 0 to 1
}

interface IOrderBookSection {
  variant?: "sell" | "buy";
  data: IOrderWithWidth[];
}

const normalizeOrders = (orders: IOrder[]): IOrderWithWidth[] => {
  const volumes = orders.map(([, qty]) => parseFloat(qty));
  const maxVolume = Math.max(...volumes, 1); // Avoid division by 0
  return orders.map(([price, qty]) => ({
    price,
    quantity: qty,
    width: parseFloat(qty) / maxVolume,
  }));
};

function OrderBookSection(props: IOrderBookSection) {
  const { variant = "sell", data } = props;

  const textColor = variant === "sell" ? "text-[#FF8970]" : "text-[#1FC16B]";
  const bgColor =
    variant === "sell" ? "bg-[rgba(255,137,112,0.3)]" : "bg-[#1e4f35]";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <p className="text-[#878787] text-sm font-semibold leading-[1.35]">
          Price (USDT)
        </p>

        <p className="text-[#878787] text-sm font-semibold leading-[1.35]">
          Amount (BTC)
        </p>
      </div>

      <div className="flex flex-col gap-1">
        {data?.slice(0, 6)?.map((item, index) => {
          return (
            <div
              key={index}
              className="flex justify-between items-center px-[3px] relative"
            >
              <p
                className={cn(
                  "text-sm font-semibold leading-[1.35] relative z-9",
                  textColor
                )}
              >
                {formatPriceSignificant(item?.price)}
              </p>

              <p className="text-[#b9b9b9] text-sm font-semibold leading-[1.35] relative z-9">
                {item.quantity}
              </p>

              <motion.div
                className={cn(
                  "absolute top-[0] right-[0] bottom-[0]  h-full rounded-[3px]",
                  bgColor
                )}
                animate={{
                  width: `${item.width * 100}%`,
                }}
              ></motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderBook() {
  const [buys, setBuys] = useState<IOrderWithWidth[]>([]);
  const [sales, setSales] = useState<IOrderWithWidth[]>([]);
  const [livePrice, setLivePrice] = useState("");

  useEffect(() => {
    const ws = new WebSocket(
      "wss://stream.binance.com:9443/stream?streams=btcusdt@depth10@100ms/btcusdt@trade"
    );

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const data = message.data;
      const stream = message.stream;

      if (stream === "btcusdt@depth10@100ms") {
        setBuys(normalizeOrders(data.bids));
        setSales(normalizeOrders(data.asks));
      }

      if (stream === "btcusdt@trade") {
        setLivePrice(data.p); // last price
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-[30px] bg-[#000] relative overflow-hidden h-full">
      <div className="flex flex-col gap-1">
        <div className="flex justify-center">
          <div className="cursor-grab w-[36px] h-[5px] bg-[#444] rounded-[2px]"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CoinStats />
            <h4 className="text-base text-[#878787] leading-[1.35] font-semibold">
              ORDER BOOK
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => {}}>
              <Question />
            </button>
            <OptionsDropdown />
          </div>
        </div>
      </div>

      <div className="px-4 flex-1 flex flex-col justify-between">
        <OrderBookSection data={sales} />
        <div className="flex flex-col items-center justify-center py-[5px] px-[10px]">
          <p className="text-[#FF8970] font-semibold text-base leading-[1.35]">
            {formatPriceSignificant(livePrice)}
          </p>
          <p className="text-[#878787] text-xs font-semibold leading-[1.35]">
            =${formatPriceSignificant(livePrice)}
          </p>
        </div>
        <OrderBookSection variant="buy" data={buys} />
      </div>
    </div>
  );
}
