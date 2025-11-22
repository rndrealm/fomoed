"use client";
import React, { useState, Fragment, useEffect } from "react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { cn } from "@/lib/utils";
import AscendexHeader from "./header";
import CreateOrder from "./create-order";
import OrderBookAndTrade from "./order-book-and-trade";
import { RenderIf } from "@/components/shared";
import { LandingScreen } from "./initial";
import ChartHeader from "./chart/chart-header";
import Balance from "./balance";
import { TradingView } from "./chart/trading-view";
import TradingPanel from "./trading-panel";
import { useReadHyperLiquidTokens } from "@/services/queries/hyperliquid";
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { useAtom } from "jotai";
import TradeResults from "./trade-results";

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
              "px-0 pb-2 bg-[#000]",
            )}
          >
            <AscendexHeader widget={widget} activeView={activeView} onViewChange={handleViewChange} />

            {/* Trading*/}
            <RenderIf condition={showTradingInterface}>
              <div className="flex h-full w-full flex-1 overflow-y-auto gap-3 px-2 pb-2">
                {/* Left + Middle section: Chart, OrderBook, and Trading Panel */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                  {/* Top row: Chart and OrderBook */}
                  <div className="flex gap-3">
                    <div className="flex-1 flex flex-col gap-2 min-w-0">
                      <ChartHeader />
                      {/* Chart placeholder */}
                      <div
                        className="bg-[#121317] rounded-[6px] flex items-center justify-center relative overflow-hidden"
                        style={{ height: "500px" }}
                      >
                        <TradingView />
                      </div>
                    </div>

                    <OrderBookAndTrade />
                  </div>

                  {/* Trading Panel under Chart and OrderBook */}
                  <div style={{ height: "280px" }}>
                    <TradingPanel />
                  </div>
                </div>

                {/* Right section: CreateOrder */}
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
            <TradeResults />
          </div>
        </div>
      </RenderIf>
    </Fragment>
  );
}
