"use client";

import React, { useEffect, useRef } from "react";
import {
  ChartingLibraryFeatureset,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
} from "../../../../../../public/static/charting_library/charting_library";
import { widget } from "../../../../../../public/static/charting_library";
import { Datafeed } from "./datafeed";
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { useAtom, useAtomValue } from "jotai";
import { useReadHyperLiquidTokens } from "@/services/queries/hyperliquid";

const initialSymbol = '{"baseTokenName":"BTC","quoteTokenName":"USDC","price":"105200.0","isSpot":false,"name":"BTC"}';

export function TradingViewChart() {
  const { data: tokensData } = useReadHyperLiquidTokens();

  const [selectedToken, setSelectedToken] = useAtom(selectedTokenAtom);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tvWidgetRef = useRef<IChartingLibraryWidget>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const defaultWidgetProps: ChartingLibraryWidgetOptions = {
      symbol: initialSymbol,
      interval: "60" as ResolutionString,
      library_path: "/static/charting_library/",
      locale: "en",
      charts_storage_url: "https://saveload.tradingview.com",
      charts_storage_api_version: "1.1",
      client_id: "tradingview.com",
      user_id: "public_user_id",
      fullscreen: false,
      autosize: true,
      container: chartContainerRef.current,
      datafeed: new Datafeed() as any,
      theme: "dark",
      disabled_features: ["volume_force_overlay", "header_compare", "header_symbol_search", "symbol_search_hot_key"],
      enabled_features: [
        "study_templates",
        "side_toolbar_in_fullscreen_mode",
        "use_localstorage_for_settings",
        "disable_legend_inplace_symbol_change" as ChartingLibraryFeatureset,
      ],
    };
    const tvWidget = new widget(defaultWidgetProps);
    tvWidgetRef.current = tvWidget;

    tvWidget.onChartReady(() => {
      tvWidget.changeTheme("dark");

      tvWidget.headerReady().then(() => {
        const button = tvWidget.createButton();
        button.setAttribute("title", "Click to show a notification popup");
        button.classList.add("apply-common-tooltip");
        button.addEventListener("click", () =>
          tvWidget.showNoticeDialog({
            title: "Notification",
            body: "TradingView Charting Library API works correctly",
            callback: () => {
              console.log("Noticed!");
            },
          }),
        );

        button.innerHTML = "Check API";
      });

      const chart = tvWidget.activeChart();
      // Subscribe to interval changes and then clear cache
      chart.onIntervalChanged().subscribe(null, () => {
        tvWidget.resetCache();
        chart.resetData();
      });
    });

    return () => {
      tvWidget.remove();
    };
  }, []);

  useEffect(() => {
    if (!tvWidgetRef.current) return;

    if (tokensData?.allTokens?.length && !selectedToken) {
      setSelectedToken(tokensData.allTokens[0]);
      return;
    }

    if (!selectedToken) return;

    const currentSymbol = tvWidgetRef.current.activeChart().symbol();
    if (currentSymbol !== selectedToken.name) {
      tvWidgetRef.current.setSymbol(
        selectedToken.tradingViewName,
        tvWidgetRef.current.activeChart().resolution(),
        () => {},
      );
    }
  }, [tokensData?.allTokens, selectedToken, setSelectedToken]);
  return (
    <div className="absolute top-0 right-0 bottom-0 left-0 flex">
      <div className="flex-1" ref={chartContainerRef}>
        <p className="text-white">TradingView</p>
      </div>
    </div>
  );
}
