import React from "react";
import SimpleCfgiChart from "./simple-cfgi-chart";
import { FullscreenableContainer } from "../../shared";
import { Skeleton } from "@/components/ui/skeleton";
import { CfgiDataResponse } from "@/services/queries/charts/types";

interface FullscreenableChartProps {
  isFullscreen: boolean;
  isPending: boolean;
  error: Error | null;
  cfgiData?: CfgiDataResponse[];
  onAnimationComplete?: () => void;
}

export function FullscreenableSimpleCfgiChart(props: FullscreenableChartProps) {
  const { isFullscreen, isPending, error, cfgiData, onAnimationComplete } = props;

  return (
    <FullscreenableContainer isFullscreen={isFullscreen} onAnimationComplete={onAnimationComplete}>
      {isPending ? (
        <Skeleton className="bg-widget-background-200 h-full w-full" />
      ) : error ? (
        <div className="flex h-full w-full items-center justify-center text-red-500">Error: {error.message}</div>
      ) : cfgiData && cfgiData.length > 0 ? (
        <SimpleCfgiChart
          cfgiData={cfgiData}
          isFullscreen={isFullscreen} 
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-500">No data available.</div>
      )}
    </FullscreenableContainer>
  );
}