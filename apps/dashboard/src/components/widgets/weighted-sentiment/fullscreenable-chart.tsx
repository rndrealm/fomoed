import React from "react";
import WeightedChart from "./chart";
import { FullscreenableContainer } from "../shared";

interface FullscreenableChartProps {
  isFullscreen: boolean;
  token?: string;
  period?: string;
  onAnimationComplete?: () => void;
}

export function FullscreenableChart(props: FullscreenableChartProps) {
  const { isFullscreen, token, period, onAnimationComplete } = props;

  return (
    <FullscreenableContainer
      isFullscreen={isFullscreen}
      onAnimationComplete={onAnimationComplete}
    >
      <WeightedChart token={token} period={period} />
    </FullscreenableContainer>
  );
}
