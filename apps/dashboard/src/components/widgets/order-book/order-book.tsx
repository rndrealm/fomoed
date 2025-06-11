"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { OptionsDropdown } from "../shared/options-dropwdown";
import { CoinStats, Question } from "@/components/icons/icons";
import { cn, formatPriceSignificant } from "@/lib/utils";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import CoinStatsTokenDropdown from "../shared/coin-stats-token-dropdown";
import {
  useFetchBinanceTokenPrice,
  useFetchBinanceTokens,
} from "@/services/queries/charts";
import { useAtomValue, useSetAtom } from "jotai";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { geoLocationAtom } from "@/lib/atoms/geoLocation";

type IOrder = [string, string]; // [price, quantity]

interface IOrderWithWidth {
  price: string;
  quantity: string;
  width: number; // 0 to 1
}

interface IOrderBookSection {
  variant?: "sell" | "buy";
  data: IOrderWithWidth[];
  token: string;
}

interface IProps {
  widget: LayoutType["widgets"][0];
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
  const { variant = "sell", data, token } = props;

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
          Amount ({token})
        </p>
      </div>

      <div className="flex flex-col gap-[3px]">
        {data?.map((item, index) => {
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
                {Number(item.quantity).toFixed(6)}
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

export default function OrderBook(props: IProps) {
  const { widget } = props;

  const [buys, setBuys] = useState<IOrderWithWidth[]>([]);
  const [sales, setSales] = useState<IOrderWithWidth[]>([]);
  const [livePrice, setLivePrice] = useState("");
  const hasLivePrice = useRef(false);

  const location = useAtomValue(geoLocationAtom);
  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  const { data: coinData = [] } = useFetchBinanceTokens(location?.country);
  const { data: price } = useFetchBinanceTokenPrice(
    widget?.props?.token,
    location?.country
  );

  useEffect(() => {
    if (!location?.country) return;
    const tokenOption = `${widget?.props?.token?.toLowerCase()}usdt`;
    // const ws = new WebSocket(
    //   `wss://stream.binance.com:9443/stream?streams=${tokenOption}@depth5@100ms/${tokenOption}@trade`
    // );

    let ws: WebSocket;

    if (location?.country === "US") {
      ws = new WebSocket(
        `wss://stream.binance.us:9443/stream?streams=${tokenOption}@depth5@100ms/${tokenOption}@trade`
      );
    } else {
      ws = new WebSocket(
        `wss://stream.binance.com:9443/stream?streams=${tokenOption}@depth5@100ms/${tokenOption}@trade`
      );
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const data = message.data;
      const stream = message.stream;

      if (stream === `${tokenOption}@depth5@100ms`) {
        setBuys(normalizeOrders(data.bids));
        setSales(normalizeOrders(data.asks));
      }

      if (stream === `${tokenOption}@trade`) {
        setLivePrice(data.p); // last price
        hasLivePrice.current = true;
      }
    };

    return () => {
      ws.close();
    };
  }, [widget?.props?.token, location?.country]);

  useEffect(() => {
    if (price?.lastPrice && !hasLivePrice.current) {
      setLivePrice(price?.lastPrice);
    }
  }, [price]);

  useEffect(() => {
    hasLivePrice.current = false;
  }, [widget?.props?.token]);

  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#000] relative overflow-hidden h-full">
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
            <OptionsDropdown widget={widget} />
          </div>
        </div>
      </div>

      <div className="">
        <CoinStatsTokenDropdown
          options={coinData}
          setValue={(coin) => {
            updateWidgetPropsFromAtom({
              tabId: activeLayout.id,
              widgetId: widget.id,
              widgetProps: {
                ...widget.props,
                token: coin,
              },
            });
          }}
          value={widget?.props?.token}
          align="start"
        />
      </div>

      <div className="px-4 flex-1 flex flex-col justify-between">
        <OrderBookSection data={sales} token={widget?.props?.token} />
        <div className="flex flex-col items-center justify-center py-[5px] px-[10px]">
          <p className="text-[#FF8970] font-semibold text-base leading-[1.35]">
            {formatPriceSignificant(livePrice)}
          </p>
          <p className="text-[#878787] text-xs font-semibold leading-[1.35]">
            =${formatPriceSignificant(livePrice)}
          </p>
        </div>
        <OrderBookSection
          variant="buy"
          data={buys}
          token={widget?.props?.token}
        />
      </div>
    </div>
  );
}
