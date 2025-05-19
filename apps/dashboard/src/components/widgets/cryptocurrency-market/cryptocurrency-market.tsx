"use client";
import React, { useEffect, useRef, memo } from "react";
import WidgetHeader from "../shared/widget-header";
import { cn } from "@/lib/utils";
import { LayoutType } from "@/lib/atoms/layoutAtom";

interface IProps {
  widget: LayoutType["widgets"][0];
}

const TradingViewCryptoScreener = () => {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "100%",
      defaultColumn: "overview",
      screener_type: "crypto_mkt",
      displayCurrency: "USD",
      colorTheme: "dark",
      locale: "en",
      fontSize: "5",
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
};

function CryptocurrencyMarket(props: IProps) {
  const { widget } = props;

  return (
    <div className="bg-[#080808] border border-[#1b1b1b] rounded-2xl px-6 py-3 flex flex-col gap-4 h-full">
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="grid items-center w-full grid-cols-3">
          <WidgetHeader widget={widget} />
        </div>
        <div
          className={cn(
            "flex flex-col justify-center w-full h-full rounded-sm"
          )}
        >
          <div className="py-2"></div>
          <div className="h-full">
            <TradingViewCryptoScreener />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CryptocurrencyMarket);
