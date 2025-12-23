"use client";

import React from "react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { WidgetWrapper } from "../shared";
import ChartHeader from "./chart/chart-header";
import { TradingView } from "./chart/trading-view";
import { cn } from "@/lib/utils";

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function TradingViewWidget({ widget }: IProps) {
  return (
    <WidgetWrapper title="Trading View" widget={widget}>
      <div
        className={cn(
          "flex h-full w-full flex-col gap-2",
        )}
      >
        {/* Chart Header */}
        <ChartHeader />

        {/* Trading View */}
        <div className="bg-[#121317] rounded-[6px] relative overflow-hidden flex-1">
          <TradingView />
        </div>
      </div>
    </WidgetWrapper>
  );
}
