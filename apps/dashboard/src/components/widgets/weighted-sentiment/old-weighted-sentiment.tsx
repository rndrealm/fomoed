"use client";

import React, { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import WidgetHeader from "../shared/widget-header";
import PeriodDropdown from "../shared/period-dropdown";
import WeightedSentimentChart from "./old-weighted-sentiment-chart";

// Sample period options for weighted sentiment
const weightedSentimentPeriods = [
  {
    label: "15M",
    value: "15m",
    periodInSeconds: 15 * 60,
  },
  {
    label: "1H",
    value: "1h",
    periodInSeconds: 60 * 60,
  },
  {
    label: "4H",
    value: "4h",
    periodInSeconds: 4 * 60 * 60,
  },
  {
    label: "1D",
    value: "1d",
    periodInSeconds: 24 * 60 * 60,
  },
];

// Use this constant for sentiment values
const SENTIMENT_VALUES = [
  0.07, -0.02, 0.21, 0.55, 0.94, -0.19, 0.31, 0.2, 0.44, -0.17, 0.45, -0.45,
  0.68, 1.59, -0.24, -0.02, 0.06, -0.16, -0.2, -0.32, 0.38, -0.91, 0.39, -0.62,
  0.47, 0.87, 0.45, -0.54, 0.99, -0.68, -0.35, -0.02, 0.34, 0.57, 0.12, -0.3,
  -0.4, -0.39, 1.09, -0.25, -0.1, -0.44, -0.51, 0.47, -0.12, 0.83, -0.12, -0.63,
  0.04, 0.16, -0.57, -0.07, -0.17, 1.34, -0.31, 1, -0.48, 0.78, -0.13, -0.26,
  0.27, 1.08, 0.23, 0.13, -0.58, -0.63, -0.48, -0.3, -0.11, -0.66, -0.1, 0.4,
  -0.34, -0.45, -0.66, -0.39, 0.62, 0.72, -0.23, 0.07, -0.2, -0.39, 0.51, -0.3,
  0.06, 0.46, 0.07, -0.37, 0.54, 0.05, -0.59, -0.79, -0.16, -0.06, -0.24, -0.98,
];

// Generate sample sentiment data
const generateSampleSentimentData = (period: string) => {
  const now = new Date();
  const data = [];
  let intervalMs = 15 * 60 * 1000; // 15 minutes default

  if (period === "1h") intervalMs = 60 * 60 * 1000;
  else if (period === "4h") intervalMs = 4 * 60 * 60 * 1000;
  else if (period === "1d") intervalMs = 24 * 60 * 60 * 1000;

  // Generate data for 2 days (288 points for 15m, 48 for 1h, 12 for 4h, 2 for 1d)
  const dataPoints =
    period === "15m" ? 288 : period === "1h" ? 48 : period === "4h" ? 12 : 2;

  for (let i = dataPoints; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMs);
    // Use the provided sentiment values, repeating as needed
    const value = SENTIMENT_VALUES[i % SENTIMENT_VALUES.length];
    data.push({
      value: value,
      datetime: timestamp.toISOString(),
    });
  }
  return data;
};

// Generate sample price data
const generateSamplePriceData = (period: string) => {
  const now = new Date();
  const data = [];
  let intervalMs = 15 * 60 * 1000; // 15 minutes default
  let basePrice = 45000; // Starting BTC price

  if (period === "1h") intervalMs = 60 * 60 * 1000;
  else if (period === "4h") intervalMs = 4 * 60 * 60 * 1000;
  else if (period === "1d") intervalMs = 24 * 60 * 60 * 1000;

  // Generate data for 2 days (288 points for 15m, 48 for 1h, 12 for 4h, 2 for 1d)
  const dataPoints =
    period === "15m" ? 288 : period === "1h" ? 48 : period === "4h" ? 12 : 2;

  for (let i = dataPoints; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMs);
    // Simulate price movement with some volatility
    const change = (Math.random() - 0.5) * 2000; // ±1000 USD change
    basePrice += change;
    data.push({
      price: Math.max(basePrice, 1000), // Ensure price doesn't go below 1000
      datetime: timestamp.toISOString(),
    });
  }
  return data;
};

interface IProps {
  widget: LayoutType["widgets"][0];
}

const WeightedSentimentWidget = (props: IProps) => {
  const { widget } = props;

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  // Generate sample data based on current period
  const currentPeriod = widget.props?.period || "15m";
  const sentimentData = useMemo(
    () => generateSampleSentimentData(currentPeriod),
    [currentPeriod],
  );
  const priceData = useMemo(
    () => generateSamplePriceData(currentPeriod),
    [currentPeriod],
  );

  return (
    <div className="bg-[#080808] border border-[#1b1b1b] rounded-2xl px-6 py-3 flex flex-col gap-4 h-full">
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="grid items-center w-full grid-cols-3">
          <WidgetHeader widget={widget} />
        </div>
        <div
          className={cn(
            "flex flex-col justify-center w-full h-full rounded-sm",
          )}
        >
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-medium">
                  BTC Weighted Sentiment
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <PeriodDropdown
                  options={weightedSentimentPeriods}
                  value={currentPeriod}
                  setValue={(value: string) => {
                    updateWidgetPropsFromAtom({
                      tabId: activeLayout.id,
                      widgetId: widget.id,
                      widgetProps: { ...widget.props, period: value },
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="h-full mx-3">
            {sentimentData && priceData ? (
              <WeightedSentimentChart
                sentimentData={sentimentData}
                priceData={priceData}
                period={currentPeriod}
              />
            ) : (
              <Skeleton className="w-full h-full bg-widget-background-200" />
            )}
          </div>

          <div className="flex items-center justify-center gap-5 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="text-xs text-grey-400">Price</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#47A663] rounded-full"></div>
                <span className="text-xs text-grey-400">Sentiment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightedSentimentWidget;
