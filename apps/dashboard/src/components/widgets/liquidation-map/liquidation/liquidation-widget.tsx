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
import { cn, modalSlide } from "@/lib/utils";
import { Close, FullScreen } from "@/components/icons/icons";
import CameraAndRefresh from "../../shared/camera-and-refresh";
import PremiumOverlay from "../../shared/premium-overlay";
import WidgetModalWrapper from "@/components/modals/widget-modal"; 
import { AnimatePresence, motion } from "motion/react";

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
  {
    label: "10x leverage",
    color: "#6EC2F0",
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

export default function LiquidationWidget(props: IProps) {
  const { widget } = props;
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false); 
  const chartRef = useRef<HTMLDivElement>(null);

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
      widgetProps: {
        ...widget.props,
        exchange_token: pairsData[0].label,
      },
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
      <WidgetWrapper widget={widget} title="Liquidation Map" handleLearnMore={() => setShowInfo(true)}>
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
                    file="Liquidation Chart.png"
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
                      <h3 className="text-base leading-[1.35] font-semibold">Liquidation Map</h3>
                      <p className="text-[13px] leading-[1.25] font-light text-neutral-400">
                        Learn about the Liquidation Map
                      </p>
                    </div>
                    <p className="text-[13px] leading-[1.35] font-medium">
                      A liquidation map is a visual chart that predicts at which price levels a large number of
                      cryptocurrency futures positions will be forcibly closed. Its horizontal axis (X-axis) shows the
                      price, while its vertical axis (Y-axis) represents the relative intensity of potential
                      liquidations, highlighting areas of high financial risk.{" "}
                    </p>
                    <p className="text-[13px] leading-[1.35] font-medium">
                      When a dense cluster of liquidations is triggered, it can cause a &quot;cascading effect.&quot;
                      The initial forced selling or buying creates rapid price movements, which in turn liquidates more
                      nearby positions. This chain reaction generates significant market volatility and a surge of
                      liquidity.{" "}
                    </p>
                    <p className="text-[13px] leading-[1.35] font-medium">
                      Traders use these maps to gain a strategic edge. They can identify optimal entry and exit points,
                      place stop-losses more intelligently to avoid being prematurely triggered, and find high-liquidity
                      zones to execute large trades with minimal price slippage.{" "}
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

        <div
          className="absolute right-[9px] bottom-[16px] z-[9] h-[28px] w-[28px] rounded-md border border-[#1c1c1c]"
          style={{
            background: "linear-gradient(180deg, #1b1b1b 0%, rgba(0, 0, 0, 0.38) 72.15%)",
            backdropFilter: "blur(7px)",
            opacity: isFullscreen ? 0 : 1,
          }}
        >
          <button className="flex h-full w-full items-center justify-center" onClick={() => setIsFullscreen(true)}>
            <FullScreen />
          </button>
        </div>
      </WidgetWrapper>
    </WidgetModalWrapper>
  );
}