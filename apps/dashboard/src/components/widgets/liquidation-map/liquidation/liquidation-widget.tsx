"use client";

import { useFetchLiquidMapData, useGetSupportedxchangePairs, useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "../../shared/coin-dropdown";
import { useEffect, useMemo, useRef, useState } from "react";
import PeriodDropdown from "../../shared/period-dropdown";
import { LiquidTabOptions, liquidTimeframeOptions } from "@/constant/cfgi-data";
import { Skeleton } from "@/components/ui/skeleton";
import ChartLegend from "../../shared/chart-legend";
import LiquidationChart from "./liquidation-chart";
import PairDropdown from "../../shared/pair-dropdown";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { exchangePairDefault } from "@/lib/static";
import { WidgetWrapper } from "../../shared";
import { AnimatePresence, motion } from "motion/react";
import { modalSlide } from "@/lib/utils";
import { Close, FullScreen } from "@/components/icons/icons"; // Import FullScreen icon
import CameraAndRefresh from "../../shared/camera-and-refresh";
import PremiumOverlay from "../../shared/premium-overlay";
import WidgetModalWrapper from "@/components/modals/widget-modal"; // Import the modal wrapper

const colorToCfgi = [
  {
    label: "100x leverage",
    color: "#ff5e00ff",
  },
  {
    label: "50x leverage",
    color: "#FFC403",
  },
  {
    label: "25x leverage",
    color: "#73D8DA",
  },
  { label: "Cumulative Short Liquidation Leverage", color: "#22AB94" },
  { label: "Cumulative Long Liquidation Leverage", color: "#FF3B10" },
];

interface IProps {
  widget: LayoutType["widgets"][0];
  fullScreenButton?: boolean; // Added prop to fix the TypeScript error
}

export default function LiquidationWidget(props: IProps) {
  const { widget, fullScreenButton } = props;

  const [showInfo, setShowInfo] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false); // State for fullscreen mode

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
  } = useFetchLiquidMapData(
    widget.props?.period,
    selectedPair?.value.exchange,
    selectedPair?.value.instrument_id,
    selectedPair?.value.base_asset,
    selectedPair?.value.quote_asset,
  );

  const [chartViewOptions] = useState(LiquidTabOptions[1].value);

  return (
    <WidgetModalWrapper widget={widget} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen}>
      <div className="relative flex h-full w-full flex-col"> {/* Added relative positioning container */}
        <WidgetWrapper widget={widget} title="Liquidation Map" handleLearnMore={() => setShowInfo(true)}>
          <div className="flex h-full w-full flex-col" ref={chartRef}>
            {/* Dropdowns and Controls */}
            <div className="py-2">
              {coinData && filteredData?.length > 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CoinDropdown
                    title=""
                    options={coinData || []}
                    value={widget.props?.token}
                    setValue={(coin: string) => {
                      const newPairs = pairsData.filter((i) => i.value.base_asset === coin);
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
                      options={liquidTimeframeOptions}
                      value={widget.props?.period || liquidTimeframeOptions[0].value}
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
                      file="Liquidation Chart.png"
                      refetch={refetch}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <PremiumOverlay>
              {/* Chart Legend */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1">
                <ChartLegend colorOptions={colorToCfgi} />
              </div>
              {/* Chart Area */}
              <div className="mx-3 flex-grow min-h-[250px]">
                {liquidationData && !isFetching ? (
                  <LiquidationChart
                    liquidationData={liquidationData}
                    viewOption={chartViewOptions}
                    token={widget.props?.token}
                  />
                ) : (
                  <Skeleton className="bg-widget-background-200 h-full w-full" />
                )}
              </div>
            </PremiumOverlay>
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
                        <h3 className="text-base leading-[1.35] font-semibold">Liquidation Map</h3>
                        <p className="text-[13px] leading-[1.25] font-light text-neutral-400">
                          Learn about the Liquidation Map
                        </p>
                      </div>
                      <p className="text-[11px] leading-[1.35] font-medium">
                        A liquidation map, also known as a &quot;liq map,&quot; provides a visual chart of liquidations or
                        liquidation risk in the futures cryptocurrency trading market. It displays liquidations that are
                        predicted based on previous price trends.
                      </p>
                      <p className="text-[11px] leading-[1.35] font-medium">
                        When traders engage in trading on unregulated cryptocurrency derivative exchanges, they are
                        constantly exposed to additional risks, namely liquidation risks. When the liquidation price of a
                        trader&apos;s position is triggered, their position is forcibly closed by the exchange&apos;s risk
                        engine.
                      </p>
                      <p className="text-[11px] leading-[1.35] font-medium">
                        The impact on the market is relatively small when a small number of positions are liquidated.
                        However, if thousands of positions with similar liquidation prices are liquidated, the effect on the
                        market price can be significant. Moreover, market buy and sell orders triggered by liquidations can
                        cause rapid price movements, leading to a &quot;cascading effect&quot; where more nearby positions
                        get liquidated. This phenomenon creates substantial price fluctuations (which institutional players
                        often take advantage of as an entry strategy since the rapid injection of liquidity within a short
                        period can meet the demand for institutional large orders).
                      </p>
                      <p className="text-[11px] leading-[1.35] font-medium">
                        Different combinations of leverage and time frames depict various clusters of liquidations. The
                        denser and higher the liquidation clusters, the greater their impact on price behavior when reached.
                      </p>
                    </div>

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
        </WidgetWrapper>
        {/* Fullscreen Button */}
        {fullScreenButton && (
          <div
            className="absolute right-[9px] bottom-[16px] z-[9] h-[28px] w-[28px] rounded-md border border-[#1c1c1c]"
            style={{
              background: "linear-gradient(180deg, #1b1b1b 0%, rgba(0, 0, 0, 0.38) 72.15%)",
              backdropFilter: "blur(7px)",
              opacity: isFullscreen ? 0 : 1,
            }}
          >
            <button
              className="flex h-full w-full items-center justify-center"
              onClick={() => {
                setIsFullscreen(true);
              }}
            >
              <FullScreen />
            </button>
          </div>
        )}
      </div>
    </WidgetModalWrapper>
  );
}

