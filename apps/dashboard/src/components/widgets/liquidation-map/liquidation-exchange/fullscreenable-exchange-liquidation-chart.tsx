import React from "react";
import LiquidationChart from "./liquidation-exchange-chart";
import { FullscreenableContainer } from "../../shared";
import { Skeleton } from "@/components/ui/skeleton";
import { FormatExcLiquidationDataResult } from "@/services/queries/charts/types";
import { cn } from "@/lib/utils";

interface FullscreenableChartProps {
  isFullscreen: boolean;
  isPending: boolean;
  liquidationData?: FormatExcLiquidationDataResult | null;
  viewOption?: string;
  token?: string;
  onAnimationComplete?: () => void;
}

export function FullscreenableExchangeLiquidationChart(props: FullscreenableChartProps) {
  const { isFullscreen, isPending, liquidationData, viewOption, token, onAnimationComplete } = props;

  return (
    <FullscreenableContainer isFullscreen={isFullscreen} onAnimationComplete={onAnimationComplete}>
      <div className={cn("h-full w-full", isFullscreen && "pt-14")}>
        {isPending ? (
          <Skeleton className="bg-widget-background-200 h-full w-full" />
        ) : liquidationData ? (
          <LiquidationChart
            liquidationData={liquidationData}
            viewOption={viewOption}
            token={token}
            isFullscreen={isFullscreen}
            onAnimationComplete={onAnimationComplete}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-500">No data available.</div>
        )}
      </div>
    </FullscreenableContainer>
  );
}
