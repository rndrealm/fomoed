import React from "react";
import OrderbookDeltaChart from "./delta-chart";
import { FullscreenableContainer } from "../shared";
import { OrderBookDeltaResponse } from "@/services/queries/charts/types";
import { Skeleton } from "@/components/ui/skeleton";

interface FullscreenableChartProps {
  isFullscreen: boolean;
  chartData?: OrderBookDeltaResponse;
  isPending: boolean;
  error: Error | null;
  onAnimationComplete?: () => void;
}

export function FullscreenableDeltaChart(props: FullscreenableChartProps) {
  const { isFullscreen, chartData, isPending, error, onAnimationComplete } = props;

  return (
    <FullscreenableContainer
      isFullscreen={isFullscreen}
      onAnimationComplete={onAnimationComplete}
    >
      {isPending ? (
        <Skeleton className="bg-widget-background-200 h-full w-full" />
      ) : error ? (
        <div className="flex h-full w-full items-center justify-center text-red-500">
          Error: {error.message}
        </div>
      ) : chartData && chartData.orderBookData && chartData.orderBookData.length > 0 ? (
        <OrderbookDeltaChart chartData={chartData} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-500">
          No data available.
        </div>
      )}
    </FullscreenableContainer>
  );
}
