"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import WidgetHeader from "../shared/widget-header";
import { LayoutType } from "@/lib/atoms/layoutAtom";

interface IProps {
  widget: LayoutType["widgets"][0];
}

interface ITradingViewPriceHistory {
  token?: string;
}

function TradingViewHeatmap(props: ITradingViewPriceHistory) {
  const { token } = props;
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      dataSource: "Crypto",
      blockSize: "market_cap_calc",
      blockColor: "24h_close_change|5",
      locale: "en",
      symbolUrl: "#",
      colorTheme: "dark",
      hasTopBar: true,
      isDataSetEnabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: "100%",
      height: "100%",
    });

    if (widgetRef.current) {
      widgetRef.current.innerHTML = ""; // Clear previous
      widgetRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container w-full h-full">
      <div
        className="tradingview-widget-container__widget h-full"
        ref={widgetRef}
      ></div>
    </div>
  );
}

export default function Heatmap(props: IProps) {
  const { widget } = props;

  return (
    <div className="bg-[#080808] border border-[#1b1b1b] rounded-2xl px-6 py-3 flex flex-col gap-4 h-full">
      <div className="flex flex-col justify-center w-full h-full">
        <div className="grid items-center w-full grid-cols-3">
          <WidgetHeader widget={widget} />
        </div>
        <div className="py-4">
          <h1 className="text-base font-medium text-white font-inter">
            Heatmap
          </h1>
        </div>
        <div
          className={cn(
            "flex flex-col justify-center w-full h-full rounded-sm"
          )}
        >
          <div className="h-full">
            <TradingViewHeatmap />
          </div>
        </div>
      </div>
    </div>
  );
}
