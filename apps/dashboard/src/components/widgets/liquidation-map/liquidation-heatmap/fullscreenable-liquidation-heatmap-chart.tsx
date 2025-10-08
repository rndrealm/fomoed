import React from "react";
import LiquidationHeatmapChart from "./liquidation-heatmap-chart";
import { FullscreenableContainer } from "../../shared";
import { Skeleton } from "@/components/ui/skeleton";
import { LiquidHeatmapResponse } from "@/services/queries/charts/types";
import { cn } from "@/lib/utils";

interface FullscreenableChartProps {
  isFullscreen: boolean;
  isPending: boolean;
  error: Error | null;
  liquidationData?: LiquidHeatmapResponse;
  onAnimationComplete?: () => void;
}

export function FullscreenableLiquidationHeatmapChart(props: FullscreenableChartProps) {
  const { isFullscreen, isPending, error, liquidationData, onAnimationComplete } = props;

  return (
    <FullscreenableContainer isFullscreen={isFullscreen} onAnimationComplete={onAnimationComplete}>
      <div className={cn("h-full w-full", isFullscreen && "pt-14")}>
        {isPending ? (
          <Skeleton className="bg-widget-background-200 h-full w-full" />
        ) : error ? (
          <div className="flex h-full w-full items-center justify-center text-red-500">Error: {error.message}</div>
        ) : liquidationData ? (
          <LiquidationHeatmapChart liquidationData={liquidationData} isFullscreen={isFullscreen} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-500">No data available.</div>
        )}
      </div>
    </FullscreenableContainer>
  );
}