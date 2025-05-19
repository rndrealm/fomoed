"use client";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import WidgetHeader from "../shared/widget-header";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "../shared/coin-dropdown";
import { useAtomValue, useSetAtom } from "jotai";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";

interface IProps {
  widget: LayoutType["widgets"][0];
}

interface ITradingViewPriceHistory {
  token: string;
}

function TradingViewPriceHistory(props: ITradingViewPriceHistory) {
  const { token } = props;
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `BINANCE:${token}USDT`,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      hide_legend: true,
      allow_symbol_change: !true,
      support_host: "https://www.tradingview.com",
    });

    if (widgetRef.current) {
      widgetRef.current.innerHTML = ""; // Clear previous
      widgetRef.current.appendChild(script);
    }
  }, [token]);

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
