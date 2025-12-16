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
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { useAtom, useAtomValue } from "jotai";
import { useReadHyperLiquidTokens } from "@/services/queries/hyperliquid";
import { RenderIf, SkeletonLoader } from "@/components/shared";
import { cn } from "@/lib/utils";

const initialSymbol = '{"baseTokenName":"BTC","quoteTokenName":"USDC","price":"105200.0","isSpot":false,"name":"BTC"}';

export function TradingViewChart() {
  const { data: tokensData } = useReadHyperLiquidTokens();

  const [selectedToken, setSelectedToken] = useAtom(selectedTokenAtom);

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
      disabled_features: [
        "volume_force_overlay",
        "header_compare",
        "header_symbol_search",
        "symbol_search_hot_key",
        "header_screenshot",
        "header_saveload",
        "header_settings",
        "header_undo_redo",
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

      const chart = tvWidget.activeChart();
      // Subscribe to interval changes and then clear cache
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
    if (tokensData?.allTokens?.length && !selectedToken) {
      setSelectedToken(tokensData.allTokens[0]);
    }
  }, [tokensData, selectedToken, setSelectedToken]);

  useEffect(() => {
    const widget = tvWidgetRef.current;

    // Only proceed if widget exists, is confirmed ready, and we have a token
    if (!widget || !isChartReady || !selectedToken) return;

    const activeChart = widget.activeChart();

    // Check if the symbol actually needs changing to prevent loops
    // Note: activeChart.symbol() might return the full exchange:symbol pair
    if (activeChart && activeChart.symbol() !== selectedToken.tradingViewName) {
      widget.setSymbol(selectedToken.tradingViewName, activeChart.resolution(), () => {});
    }
  }, [selectedToken, isChartReady]);

  return (
    <div className="absolute top-0 right-0 bottom-0 left-0 flex">
      <RenderIf condition={!isChartReady}>
        <SkeletonLoader widthFull heightFull backgroundColor="#121317" borderRadius={0} />
      </RenderIf>
      <div className={cn("flex-1", !isChartReady && "invisible")} ref={chartContainerRef}></div>
    </div>
  );
}
