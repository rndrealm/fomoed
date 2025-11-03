"use client";
import React, { useState, Fragment } from "react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { cn } from "@/lib/utils";
import AscendexHeader from "./header";
import CreateOrder from "./create-order";
import OrderBookAndTrade from "./order-book-and-trade";
import { RenderIf } from "@/components/shared";
import { LandingScreen } from "./initial";
import ChartHeader from "./chart/chart-header";
import Balance from "./balance";

interface IProps {
  widget: LayoutType["widgets"][0];
}

type ViewType = "futures" | "spot" | "lend" | "conditional" | "balance" | "settings";

export default function Ascendex(props: IProps) {
  const { widget } = props;
  const [isLoaded, setIsLoaded] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>("futures");

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
  };

  const showTradingInterface = ["futures", "spot", "lend", "conditional"].includes(activeView);

  return (
    <Fragment>
      <RenderIf condition={!isLoaded}>
        <LandingScreen
          handleIsLoaded={() => {
            setIsLoaded(true);
          }}
        />
      </RenderIf>

      <RenderIf condition={isLoaded}>
        <div className="relative flex h-full w-full justify-center items-center">
          <div
            className={cn(
              "relative flex h-full w-full flex-col gap-2 overflow-hidden rounded-2xl",
              "px-0 pb-0 bg-[#000]",
            )}
          >
            <AscendexHeader widget={widget} activeView={activeView} onViewChange={handleViewChange} />

            {/* Trading*/}
            <RenderIf condition={showTradingInterface}>
              <div className="flex h-full w-full flex-1 overflow-hidden gap-3 px-2 pb-2">
                <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
                  <ChartHeader />

                  {/* Chart placeholder */}
                  <div className="flex-1 bg-[#121317] rounded-[6px] flex items-center justify-center">
                    <span className="text-[#9CA3AF] text-sm">
                      {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Trading View
                    </span>
                  </div>
                </div>

                <OrderBookAndTrade />

                <CreateOrder />
              </div>
            </RenderIf>

            {/* Balance */}
            <RenderIf condition={activeView === "balance"}>
              <div className="flex h-full w-full flex-1 overflow-hidden gap-3 px-2 pb-2">
                <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
                  <Balance />
                </div>
              </div>
            </RenderIf>

            {/* Settings */}
            <RenderIf condition={activeView === "settings"}>
              <div className="flex h-full w-full flex-1 overflow-hidden gap-3 px-2 pb-2">
                <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
                  <div className="bg-[#121317] rounded-[10px] p-6 flex-1">
                    <h2 className="text-white text-xl font-semibold mb-4">Settings</h2>
                    <p className="text-[#9CA3AF]">Settings component will go here</p>
                  </div>
                </div>
              </div>
            </RenderIf>
          </div>
        </div>
      </RenderIf>
    </Fragment>
  );
}
