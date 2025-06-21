"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Close } from "@/components/icons/icons";
import { cn, formatPriceSignificant, modalSlide } from "@/lib/utils";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import CoinStatsTokenDropdown from "../shared/coin-stats-token-dropdown";
import {
  useFetchBinanceTokenPrice,
  useFetchBinanceTokens,
} from "@/services/queries/charts";
import { useAtomValue, useSetAtom } from "jotai";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { geoLocationAtom } from "@/lib/atoms/geoLocation";
import { WidgetWrapper } from "../shared";

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
      <div className="flex items-center justify-between">
        <p className="text-[#878787] text-sm font-semibold leading-[1.35] select-none">
          Price (USDT)
        </p>

        <p className="text-[#878787] text-sm font-semibold leading-[1.35] select-none">
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
  const previousPriceRef = useRef<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(
    null
  );
  const [showInfo, setShowInfo] = useState(false);

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
    // if (!location?.country) return;
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
        const currentPrice = parseFloat(data.p);
        setLivePrice(data.p); // last price

        if (previousPriceRef.current !== null) {
          if (currentPrice > previousPriceRef.current) {
            setPriceDirection("up");
          } else if (currentPrice < previousPriceRef.current) {
            setPriceDirection("down");
          }
        }

        previousPriceRef.current = currentPrice;
        hasLivePrice.current = true;
      }
    };

    return () => {
      ws.close();
    };
  }, [widget?.props?.token, location?.country]);

  useEffect(() => {
    if (price?.lastPrice && !hasLivePrice.current) {
      const currentPrice = parseFloat(price.lastPrice);
      setLivePrice(price.lastPrice);

      if (previousPriceRef.current !== null) {
        if (currentPrice > previousPriceRef.current) {
          setPriceDirection("up");
        } else if (currentPrice < previousPriceRef.current) {
          setPriceDirection("down");
        }
      }

      previousPriceRef.current = currentPrice;
    }
  }, [price]);

  useEffect(() => {
    hasLivePrice.current = false;
  }, [widget?.props?.token]);

  return (
    <WidgetWrapper
      title="ORDER BOOK"
      widget={widget}
      handleLearnMore={() => {
        setShowInfo(true);
      }}
    >
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

      <div className="flex flex-col justify-between flex-1 sm:px-2 md:px-4">
        <OrderBookSection data={sales} token={widget?.props?.token} />
        <div className="flex flex-col items-center justify-center py-[5px] px-[10px]">
          <p
            className={cn(
              "font-semibold text-base leading-[1.35]",
              priceDirection === "up" && "text-[#1FC16B]",
              priceDirection === "down" && "text-[#FF8970]",
              !priceDirection && "text-white"
            )}
          >
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

      <AnimatePresence>
        {showInfo && (
          <div className="absolute  bottom-[10px] left-[10px] right-[10px] top-[10px] z-9 flex items-end">
            <motion.div
              className="bg-[#111] rounded-[22px] py-4 px-5 overflow-auto max-h-full scrollbar"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4 overflow-auto">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-base leading-[1.35] text-white">
                      Order Book
                    </h3>
                    <p className="font-light text-[13px] leading-[1.25] text-[#878787]">
                      Learn about the Order Book
                    </p>
                  </div>
                  <p className="font-medium text-[13px] leading-[1.35] text-white">
                    An order book displays all outstanding buy and sell orders
                    for an asset, grouped by price. It provides a transparent,
                    real-time view of market liquidity and the potential supply
                    and demand at different price points, helping traders
                    understand market depth and sentiment.
                  </p>
                </div>

                <p className="text-[#696969] text-xs font-semibold text-[1.25]">
                  We use data from{" "}
                  <a href="https://www.binance.com/" target="_blank">
                    Binance.com
                  </a>{" "}
                  &{" "}
                  <a href="https://www.binance.us/" target="_blank">
                    Binance.us
                  </a>
                </p>

                <div className="flex justify-center">
                  <button
                    type="button"
                    className="rounded-[40px] bg-[#272727] flex items-center justify-center gap-1 h-[26px] app_widget_button"
                    onClick={() => {
                      setShowInfo(false);
                    }}
                  >
                    <p className="font-medium text-[13px] text-white whitespace-nowrap app_widget_button__text">
                      Close
                    </p>
                    <div className="app_widget_button__icon">
                      <Close fill="#878787" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </WidgetWrapper>
  );
}
