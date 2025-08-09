import React from "react";
import { Pricing } from "./pricing";
import { Comments } from "./comments";

export function SignalDetails() {
  return (
    <div className="flex flex-col gap-8 flex-1">
      <div className="flex flex-col gap-2 max-w-[461px] w-full">
        <h3 className="text-white text-lg leading-[1.35] tracking-[-0.4%] font-medium">
          Noah Shiffman’s Liquidity threshold Indicator
        </h3>
        <p className="text-[#D4D4D4] text-sm leading-[1.35] tracking-[-0.4%]">
          Track the precise liquidity zones that matter most. This smart signal
          scans market depth in real-time, highlighting thresholds where large
          buy or sell walls are likely to trigger significant price reactions.
          By identifying these liquidity “pressure points,” traders can
          anticipate moves before they happen — filtering out market noise and
          focusing only on high-impact levels.
        </p>
      </div>

      <Pricing />

      <Comments />
    </div>
  );
}
