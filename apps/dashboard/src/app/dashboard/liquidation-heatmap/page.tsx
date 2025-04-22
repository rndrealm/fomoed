"use client";

import LiquidationHeatmapWidget from "@/components/widgets/liquidation-map/liquidation-heatmap/liquidation-heatmap-widget";

export default function Home() {
  return (
    <div className="grid place-items-center bg-[#0D0D0D] min-h-screen justify-center items-center">
      <LiquidationHeatmapWidget />
    </div>
  );
}
