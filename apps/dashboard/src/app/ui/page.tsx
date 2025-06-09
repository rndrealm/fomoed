"use client";
import React, { useState } from "react";
import TestChart from "@/components/widgets/price-history/test-chart";

export default function Page() {
  const [isCandleStick, setIsCandleStick] = useState(false);

  return (
    <div className="h-[400px]">
      <button
        onClick={() => {
          setIsCandleStick(!isCandleStick);
        }}
      >
        CHANGE
      </button>
      <TestChart isCandleStick={isCandleStick} period="15m" token="BTC" />
    </div>
  );
}
