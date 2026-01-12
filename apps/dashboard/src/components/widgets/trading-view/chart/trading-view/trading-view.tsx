"use client";

import React, { Fragment, use, useEffect, useMemo, useRef, useState } from "react";
import {
  ChartingLibraryFeatureset,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
} from "../../../../../../public/static/charting_library/charting_library";
import { widget } from "../../../../../../public/static/charting_library";
import { Datafeed } from "./datafeed";
import { selectedTokenAtomWidgets } from "@/lib/atoms/tradingViewWidget";
import { useAtom, useAtomValue } from "jotai";
import { useReadHyperLiquidTokens } from "@/services/queries/hyperliquid";
import { useReadAlpacaStocks } from "@/services/queries/alpaca";
import { RenderIf, SkeletonLoader } from "@/components/shared";
import { cn } from "@/lib/utils";

const initialSymbol = '{"baseTokenName":"BTC","quoteTokenName":"USDC","price":"105200.0","isSpot":false,"name":"BTC","type":"crypto"}';

export function TradingViewChart() {
  const { data: tokensData } = useReadHyperLiquidTokens();
  const { data: stocksData } = useReadAlpacaStocks();

  const [selectedToken, setSelectedToken] = useAtom(selectedTokenAtomWidgets);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tvWidgetRef = useRef<IChartingLibraryWidget>(null);
  const [isChartReady, setIsChartReady] = useState(false);

  const datafeed = useMemo(() => new Datafeed(), []);

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
      datafeed: datafeed as any,
      theme: "dark",
      auto_save_delay: 3,
      disabled_features: [
        "volume_force_overlay",
        "header_compare",
        "header_symbol_search",
        "symbol_search_hot_key",
        "header_screenshot",
        "header_saveload",
        "header_settings",
        "header_undo_redo",
        "create_volume_indicator_by_default",
      ],
      enabled_features: [
        "study_templates",
        "side_toolbar_in_fullscreen_mode",
        "use_localstorage_for_settings",
        "disable_legend_inplace_symbol_change" as ChartingLibraryFeatureset,
      ],
      loading_screen: {
        backgroundColor: "#121317",
      },
      overrides: {
        "paneProperties.background": "#121317",
        "paneProperties.backgroundType": "solid",
      },
      toolbar_bg: "#121317",
    };
    const tvWidget = new widget(defaultWidgetProps);
    tvWidgetRef.current = tvWidget;

    tvWidget.onChartReady(() => {
      tvWidget.setCSSCustomProperty("--tv-color-pane-background", "#121317");
      setIsChartReady(true);

      const savedState = localStorage.getItem("tv_widget_state");

      if (savedState) {
        try {
          const parsedData = JSON.parse(savedState);
          tvWidget.load(parsedData);
        } catch (e) {
          console.error("Failed to load chart data:", e);
        }
      }

      tvWidget.subscribe("onAutoSaveNeeded", () => {
        tvWidget.save((chartData) => {
          localStorage.setItem("tv_widget_state", JSON.stringify(chartData));
        });
      });

      const chart = tvWidget.activeChart();
      chart.onIntervalChanged().subscribe(null, () => {
        tvWidget.resetCache();
        chart.resetData();
      });
      chart.getTimeScale().setBarSpacing(30);
    });

    return () => {
      tvWidget.remove();
    };
  }, [datafeed]);

  useEffect(() => {
    const widget = tvWidgetRef.current;

    // Set default to first crypto token if no selection
    if (tokensData?.allTokens?.length && !selectedToken) {
      const firstToken = tokensData.allTokens[0];
      setSelectedToken({ ...firstToken, type: "crypto" });
      return;
    }

    if (!widget || !isChartReady || !selectedToken) return;

    const activeChart = widget.activeChart();

    // Create symbol string for TradingView
    let symbolString: string;
    if (selectedToken.type === "stock") {
      symbolString = JSON.stringify(selectedToken);
    } else {
      // For crypto, use existing tradingViewName if available
      symbolString = (selectedToken as any).tradingViewName || JSON.stringify(selectedToken);
    }

    if (activeChart && activeChart.symbol() !== symbolString) {
      widget.setSymbol(symbolString, activeChart.resolution(), () => {
        console.log(`Symbol changed to: ${selectedToken.displayName || selectedToken.symbol}`);
      });
    }
  }, [tokensData?.allTokens, stocksData?.stocks, selectedToken, setSelectedToken, isChartReady]);

  return (
    <div className="absolute top-0 right-0 bottom-0 left-0 flex">
      <RenderIf condition={!isChartReady}>
        <SkeletonLoader widthFull heightFull backgroundColor="#121317" borderRadius={0} />
      </RenderIf>
      <div className={cn("flex-1", !isChartReady && "invisible")} ref={chartContainerRef}></div>
    </div>
  );
}