"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Close } from "@/components/icons/icons";
import { cn, formatPriceSignificant, modalSlide } from "@/lib/utils";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import CoinStatsTokenDropdown from "../shared/coin-stats-token-dropdown";
import { useFetchBinanceTokenPrice, useFetchBinanceTokens } from "@/services/queries/charts";
import { useAtomValue, useSetAtom } from "jotai";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { geoLocationAtom } from "@/lib/atoms/geoLocation";
import { WidgetWrapper } from "../shared";
import { OrderBookSection } from "./order-book-section";
import { BinanceTicker, CoinDataInterface } from "@/services/queries/charts/types";
import { slice } from "lodash-es";

type IOrder = [string, string]; // [price, quantity]

interface IOrderWithWidth {
  price: string;
  quantity: string;
  width: number; // 0 to 1
}

interface IOrders {
  price?: BinanceTicker;
  widget: LayoutType["widgets"][0];
  coinData: CoinDataInterface[];
  slice: number;
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

function Orders(props: IOrders) {
  const { widget, coinData, price, slice } = props;

  const [buys, setBuys] = useState<IOrderWithWidth[]>([]);
  const [sales, setSales] = useState<IOrderWithWidth[]>([]);
  const [livePrice, setLivePrice] = useState("");
  const previousPriceRef = useRef<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const hasLivePrice = useRef(false);

  const location = useAtomValue(geoLocationAtom);
  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  useEffect(() => {
    const tokenOption = `${widget?.props?.token?.toLowerCase()}usdt`;

    const eventSource = new EventSource(
      `/api/websocket-proxy?token=${widget?.props?.token}&country=${location?.country || "global"}&streamType=orderbook`,
    );

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const data = message.data;
        const stream = message.stream;

        if (stream === `${tokenOption}@depth20@100ms`) {
          setBuys(normalizeOrders(data.bids));
          setSales(normalizeOrders(data.asks));
        }

        if (stream === `${tokenOption}@trade`) {
          const currentPrice = parseFloat(data.p);
          setLivePrice(data.p);

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

      <div className="flex flex-1 flex-col justify-between sm:px-2 md:px-4">
        <OrderBookSection data={sales?.slice(0, slice)} token={widget?.props?.token} />
        <div className="flex flex-col items-center justify-center px-[10px] py-[5px]">
          <p
            className={cn(
              "text-base leading-[1.35] font-semibold",
              priceDirection === "up" && "text-[#1FC16B]",
              priceDirection === "down" && "text-[#FF8970]",
              !priceDirection && "text-white",
            )}
          >
            {formatPriceSignificant(livePrice)}
          </p>
          <p className="text-xs leading-[1.35] font-semibold text-[#878787]">=${formatPriceSignificant(livePrice)}</p>
        </div>
        <OrderBookSection variant="buy" data={buys?.slice(0, slice)} token={widget?.props?.token} />
      </div>

      <AnimatePresence>
        {showInfo && (
          <div className="absolute top-[10px] right-[10px] bottom-[10px] left-[10px] z-9 flex items-end">
            <motion.div
              className="scrollbar max-h-full overflow-auto rounded-[22px] bg-[#111] px-5 py-4"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4 overflow-auto">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <h3 className="text-base leading-[1.35] font-semibold text-white">Order Book</h3>
                    <p className="text-[13px] leading-[1.25] font-light text-[#878787]">Learn about the Order Book</p>
                  </div>
                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    An order book displays all outstanding buy and sell orders for an asset, grouped by price. It
                    provides a transparent, real-time view of market liquidity and the potential supply and demand at
                    different price points, helping traders understand market depth and sentiment.
                  </p>
                </div>

                <p className="text-xs font-semibold text-[#696969] text-[1.25]">
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
                    className="app_widget_button flex h-[26px] items-center justify-center gap-1 rounded-[40px] bg-[#272727]"
                    onClick={() => {
                      setShowInfo(false);
                    }}
                  >
                    <p className="app_widget_button__text text-[13px] font-medium whitespace-nowrap text-white">
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

const dataLengthMap = {
  "4": 6,
  "5": 9,
  "6": 11,
};

export default function OrderBook(props: IProps) {
  const { widget } = props;

  const location = useAtomValue(geoLocationAtom);

  const { data: coinData = [] } = useFetchBinanceTokens(location?.country);
  const { data: price } = useFetchBinanceTokenPrice(widget?.props?.token, location?.country);

  return (
    <Orders
      widget={widget}
      price={price}
      coinData={coinData}
      slice={dataLengthMap[`${widget?.meta?.h}` as keyof typeof dataLengthMap] || 4}
    />
  );
}
