"use client";

import { useFetchLiquidDataMerged, useGetSupportedxchangePairs, useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "../../shared/coin-dropdown";
import { useRef, useState } from "react";
import PeriodDropdown from "../../shared/period-dropdown";
import { LiquidTabOptions, liquidTimeframeOptions } from "@/constant/cfgi-data";
import { Skeleton } from "@/components/ui/skeleton";
import ChartLegend from "../../shared/chart-legend";
import LiquidationChart from "./liquidation-exchange-chart";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { WidgetWrapper } from "../../shared";
import PremiumOverlay from "../../shared/premium-overlay";
import { AnimatePresence, motion } from "motion/react";
import { cn, modalSlide } from "@/lib/utils";
import { FullScreen, Close } from "@/components/icons/icons";
import CameraAndRefresh from "../../shared/camera-and-refresh";
import WidgetModalWrapper from "@/components/modals/widget-modal";
import FullScreenButtonV2 from "../../shared/fullscreen-buttonv2";

const colorToCfgi = [
  {
    label: "Binance",
    color: "#ff5e00ff",
  },
  {
    label: "Bybit",
    color: "#73D8DA",
  },
  {
    label: "OKX",
    color: "#FFC403",
  },
  {
    label: "Cumulative Short Liquidation Leverage",
    color: "#22AB94",
  },
  {
    label: "Cumulative Long Liquidation Leverage",
    color: "#FF3B10",
  },
];

interface IProps {
  widget: LayoutType["widgets"][0];
  fullScreenButton?: boolean;
}

export default function LiquidationExchangeWidget(props: IProps) {
  const { widget } = props;
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const { data: coinData } = useReadCoinList();
  const { data: pairsData } = useGetSupportedxchangePairs();
  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  const {
    data: liquidationData,
    isFetching,
    refetch,
  } = useFetchLiquidDataMerged(widget.props?.period, widget.props?.token);

  const [chartViewOptions] = useState(LiquidTabOptions[1].value);

  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  return (
    <WidgetModalWrapper widget={widget} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen}>
      <WidgetWrapper widget={widget} title="Exchange Liquidation Map" handleLearnMore={() => setShowInfo(true)}>
        <div className={cn("relative flex h-full w-full flex-col")} ref={chartRef}>
          {coinData && (
            <div className="py-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CoinDropdown
                  title=""
                  options={coinData || []}
                  value={widget.props?.token}
                  setValue={(coin: string) => {
                    const newPairs = pairsData?.filter((i) => i.value.base_asset === coin);
                    updateWidgetPropsFromAtom({
                      tabId: activeLayout.id,
                      widgetId: widget.id,
                      widgetProps: {
                        ...widget.props,
                        token: coin,
                        exchange_token: newPairs && newPairs.length > 0 ? newPairs[0].label : "",
                      },
                    });
                  }}
                />
                <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 w-full sm:w-auto">
                  <PeriodDropdown
                    options={liquidTimeframeOptions}
                    value={widget.props?.period || liquidTimeframeOptions[0].value}
                    setValue={(value: string) => {
                      updateWidgetPropsFromAtom({
                        tabId: activeLayout.id,
                        widgetId: widget.id,
                        widgetProps: {
                          ...widget.props,
                          period: value,
                        },
                      });
                    }}
                  />
                  <CameraAndRefresh
                    isFetching={isFetching}
                    chartRef={chartRef}
                    file="Exchange Liquidation Map Chart.png"
                    refetch={refetch}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex h-full w-full flex-col">
            <div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1">
                <ChartLegend colorOptions={colorToCfgi} />
              </div>
            </div>
            <PremiumOverlay>
              <div className="mx-3 flex-grow min-h-[250px]">
                {liquidationData && !isFetching ? (
                  <LiquidationChart
                    liquidationData={liquidationData}
                    viewOption={chartViewOptions}
                    token={widget.props?.token}
                    isFullscreen={isFullscreen}
                  />
                ) : (
                  <Skeleton className="bg-widget-background-200 h-full w-full" />
                )}
              </div>
            </PremiumOverlay>
          </div>
        </div>

        {/* Learn More Modal */}
        <AnimatePresence>
          {showInfo && (
            <div className="absolute top-[10px] right-[10px] bottom-[10px] left-[10px] z-9 flex items-end">
              <motion.div
                className="scrollbar max-h-full overflow-auto rounded-[22px] bg-neutral-800 text-white px-5 py-4"
                variants={modalSlide}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="flex flex-col gap-4 overflow-auto">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <h3 className="text-base leading-[1.35] font-semibold">Exchange Liquidation Map</h3>
                      <p className="text-[13px] leading-[1.25] font-light text-neutral-400">
                        Learn about the Exchange Liquidation Map
                      </p>
                    </div>
                    <p className="text-[13px] leading-[1.35] font-medium">
                      An Exchange liquidation map is a visual chart that predicts at which price levels a large number
                      of cryptocurrency futures positions will be forcibly closed. Its horizontal axis (X-axis) shows
                      the price, while its vertical axis (Y-axis) represents the relative intensity of potential
                      liquidations, highlighting areas of high financial risk.
                    </p>
                    <p className="text-[13px] leading-[1.35] font-medium">
                      When a dense cluster of liquidations is triggered, it can cause a &quot;cascading effect.&quot;
                      The initial forced selling or buying creates rapid price movements, which in turn liquidates more
                      nearby positions. This chain reaction generates significant market volatility and a surge of
                      liquidity.
                    </p>
                    <p className="text-[13px] leading-[1.35] font-medium">
                      Traders use these maps to gain a strategic edge. They can identify optimal entry and exit points,
                      place stop-losses more intelligently to avoid being prematurely triggered, and find high-liquidity
                      zones to execute large trades with minimal price slippage.
                    </p>
                  </div>

                  <p className="text-xs font-semibold text-neutral-400 text-[1.25]">
                    We use data from{" "}
                    <a href="https://www.coinglass.com/" target="_blank" className="underline">
                      Coinglass.com
                    </a>
                  </p>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      className="app_widget_button flex h-[26px] items-center justify-center gap-1 rounded-[40px] bg-neutral-700"
                      onClick={() => setShowInfo(false)}
                    >
                      <p className="app_widget_button__text text-[13px] font-medium whitespace-nowrap">Close</p>
                      <div className="app_widget_button__icon">
                        <Close />
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Fullscreen button */}
        <FullScreenButtonV2 toggleFullscreen={toggleFullscreen} />
      </WidgetWrapper>
    </WidgetModalWrapper>
  );
}
