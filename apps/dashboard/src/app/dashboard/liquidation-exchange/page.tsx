"use client";

import LiquidationExchangeWidget from "@/components/widgets/liquidation-map/liquidation-exchange/liquidation-exchange-widget";

export default function Home() {
  return (
    <div className="grid place-items-center bg-[#0D0D0D] min-h-screen justify-center items-center">
      <LiquidationExchangeWidget />
    </div>
  );
}
