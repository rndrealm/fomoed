"use client";

import { useFetchLiquidHeatMapData, useGetSupportedxchangePairs, useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "../../shared/coin-dropdown";
import { useEffect, useMemo, useRef, useState } from "react";
import PeriodDropdown from "../../shared/period-dropdown";
import { liquidHeatMapTimeframeOptions } from "@/constant/cfgi-data";
import { Skeleton } from "@/components/ui/skeleton";
import ChartLegend from "../../shared/chart-legend";
import PairDropdown from "../../shared/pair-dropdown";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { exchangePairDefault } from "@/lib/static";
import PremiumOverlay from "../../shared/premium-overlay";
import CameraAndRefresh from "../../shared/camera-and-refresh";
import { FullScreen } from "@/components/icons/icons";
import WidgetModalWrapper from "@/components/modals/widget-modal";
import { WidgetWrapper } from "../../shared";
import LiquidationHeatmapChart from "./liquidation-heatmap-chart";
import { AnimatePresence, motion } from "motion/react";
import { Close } from "@/components/icons/icons";
import { modalSlide } from "@/lib/utils";
import FullScreenButtonV2 from "../../shared/fullscreen-buttonv2";

const colorToCfgi = [
  {
    label: "Liquidation leverage",
    color: "#21AA94",
  },
  {
    label: "Supercharts",
    color: "#7382DA",
  },
];
interface IProps {
  widget: LayoutType["widgets"][0];
  fullScreenButton?: boolean;
}

export default function LiquidationHeatmapWidget(props: IProps) {
  const { widget } = props;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState(false);

  const { data: coinData } = useReadCoinList();
  const { data: pairsData } = useGetSupportedxchangePairs();
  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  const selectedPair = useMemo(() => {
    return pairsData?.find((pr) => pr.label === widget.props?.exchange_token);
  }, [pairsData, widget.props?.exchange_token]);

  useEffect(() => {
    if (!pairsData?.length || selectedPair) return;
    updateWidgetPropsFromAtom({
      tabId: activeLayout.id,
      widgetId: widget.id,
      widgetProps: { ...widget.props, exchange_token: pairsData[0].label },
    });
  }, [pairsData, selectedPair, activeLayout.id, updateWidgetPropsFromAtom, widget.id, widget.props]);

  const filteredData = useMemo(() => {
    if (!pairsData) return [];
    return pairsData.filter((i) => i.value.base_asset === widget.props?.token);
  }, [pairsData, widget.props?.token]);

  const {
    data: liquidationData,
    isFetching,
    refetch,
  } = useFetchLiquidHeatMapData(widget.props?.period, selectedPair?.value.exchange, selectedPair?.value.symbol);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <WidgetModalWrapper widget={widget} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen}>
      <WidgetWrapper widget={widget} title="Liquidation Heatmap" handleLearnMore={() => setShowInfo(true)}>
        <div className="relative flex h-full w-full flex-col" ref={chartRef}>
          {coinData && filteredData?.length > 0 && (
            <div className="py-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CoinDropdown
                  title=""
                  options={coinData || []}
                  value={widget.props?.token}
                  setValue={(coin: string) => {
                    const newPairs = pairsData!.filter((i) => i.value.base_asset === coin);
                    updateWidgetPropsFromAtom({
                      tabId: activeLayout.id,
                      widgetId: widget.id,
                      widgetProps: {
                        ...widget.props,
                        token: coin,
                        exchange_token: newPairs[0].label,
                      },
                    });
                  }}
                />
                <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 w-full sm:w-auto">
                  <PairDropdown
                    options={filteredData}
                    value={selectedPair || exchangePairDefault}
                    setValue={(value) => {
                      updateWidgetPropsFromAtom({
                        tabId: activeLayout.id,
                        widgetId: widget.id,
                        widgetProps: {
                          ...widget.props,
                          exchange_token: value.label,
                        },
                      });
                    }}
                  />
                  <PeriodDropdown
                    options={liquidHeatMapTimeframeOptions}
                    value={widget.props?.period || liquidHeatMapTimeframeOptions[0].value}
                    setValue={(value: string) => {
                      updateWidgetPropsFromAtom({
                        tabId: activeLayout.id,
                        widgetId: widget.id,
                        widgetProps: { ...widget.props, period: value },
                      });
                    }}
                  />
                  <CameraAndRefresh
                    isFetching={isFetching}
                    chartRef={chartRef}
                    file="Liquidation Heatmap Chart.png"
                    refetch={refetch}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Chart Section */}
          <div className="flex h-full w-full flex-col">
            <div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1">
                <ChartLegend colorOptions={colorToCfgi} />
              </div>
            </div>
            <PremiumOverlay>
              <div className="mx-3 flex-grow min-h-[250px]">
                {liquidationData && !isFetching ? (
                  <LiquidationHeatmapChart liquidationData={liquidationData} />
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
            <div className="absolute top-[10px] right-[10px] bottom-[10px] left-[10px] z-10 flex items-end">
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
                      <h3 className="text-base leading-[1.35] font-semibold">Liquidation Heatmap</h3>
                      <p className="text-[13px] leading-[1.25] font-light text-neutral-400">
                        Learn about the Liquidation Heatmap
                      </p>
                    </div>
                    <p className="text-[13px] leading-[1.35] font-medium">
                      A Liquidation Heatmap is a chart that predicts price levels where large-scale liquidations might
                      occur. When trader&apos;s leveraged positions lack sufficient margin, exchanges forcibly close
                      them, creating these events. The heatmap helps traders identify these high-liquidity zones.
                    </p>
                    <p className="text-[13px] leading-[1.35] font-medium">
                      The chart calculates potential liquidation levels using market data for various leverage amounts.
                      As more estimated liquidations are added to a price, the colors change from purple (low
                      concentration) to yellow (high concentration), highlighting areas of high risk and liquidity.
                    </p>
                    <div className="flex flex-col gap-2">
                      <p className="text-[13px] leading-[1.35] font-semibold">How traders can use it:</p>
                      <ul className="list-disc pl-5 space-y-2 text-[13px] font-medium">
                        <li>
                          <strong>Magnet Zone:</strong> A high concentration of liquidations can act as a
                          &quot;magnet,&quot; suggesting the price may move toward that area.
                        </li>
                        <li>
                          <strong>Support/Resistance:</strong> These high-liquidity zones can also function as strong
                          support or resistance levels. When large orders are filled, the price often reverses.
                        </li>
                      </ul>
                    </div>
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
