"use client";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import WidgetHeader from "../shared/widget-header";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "../shared/coin-dropdown";
import { useAtomValue, useSetAtom } from "jotai";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";

export const pricePeriodOptions = [
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "5m", label: "5M" },
  { value: "15m", label: "15M" },
  { value: "30m", label: "30M" },
  { value: "1h", label: "1H" },
  { value: "2h", label: "2H" },
  { value: "4h", label: "4H" },
  { value: "6h", label: "6H" },
  { value: "8h", label: "8H" },
  { value: "12h", label: "12H" },
  { value: "1d", label: "1D" },
  { value: "3d", label: "3D" },
  { value: "1w", label: "1W" },
];

const tradingViewDurationMap = {
  "1m": "1",
  "3m": "3",
  "5m": "5",
  "15m": "15",
  "30m": "30",
  "1h": "60",
  "2h": "120",
  "4h": "240",
  "1d": "D",
  "1w": "W",
};

interface IProps {
  widget: LayoutType["widgets"][0];
}

interface ITradingViewPriceHistory {
  token: string;
  duration?: keyof typeof tradingViewDurationMap;
}

export function TradingViewPriceHistory(props: ITradingViewPriceHistory) {
  const { token, duration = "15m" } = props;
  const widgetRef = useRef<HTMLDivElement>(null);
  const period = tradingViewDurationMap[duration] || "15";

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `BINANCE:${token}USDT`,
      interval: period,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      hide_legend: true,
      allow_symbol_change: true,
      support_host: "https://www.tradingview.com",
      hide_side_toolbar: false,
    });

    if (widgetRef.current) {
      widgetRef.current.innerHTML = ""; // Clear previous
      widgetRef.current.appendChild(script);
    }
  }, [token, period]);

  return (
    <div className="tradingview-widget-container w-full h-full">
      <div
        className="tradingview-widget-container__widget h-full"
        ref={widgetRef}
      ></div>
    </div>
  );
}

export default function PriceHistory(props: IProps) {
  const { widget } = props;
  const { data: coinData } = useReadCoinList();

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  return (
    <div className="bg-[#080808] border border-[#1b1b1b] rounded-2xl px-6 py-3 flex flex-col gap-4 h-full">
      <div className="flex flex-col justify-center w-full h-full">
        <div className="grid items-center w-full grid-cols-3">
          <WidgetHeader widget={widget} />
        </div>
        <div className="py-4">
          {coinData ? (
            <div className="flex items-center justify-between">
              <CoinDropdown
                options={coinData || []}
                value={widget.props?.token}
                setValue={(coin: string) => {
                  updateWidgetPropsFromAtom({
                    tabId: activeLayout.id,
                    widgetId: widget.id,
                    widgetProps: { ...widget.props, token: coin },
                  });
                }}
                title="Advanced Real-Time Chart"
              />
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            "flex flex-col justify-center w-full h-full rounded-sm"
          )}
        >
          <div className="h-full">
            <TradingViewPriceHistory token={widget.props?.token || ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
