"use client";

import { useFetchLiquidHeatMapData, useGetSupportedxchangePairs, useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "../../shared/coin-dropdown";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PeriodDropdown from "../../shared/period-dropdown";
import { liquidHeatMapTimeframeOptions } from "@/constant/cfgi-data";
import ChartLegend from "../../shared/chart-legend";
import PairDropdown from "../../shared/pair-dropdown";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { exchangePairDefault } from "@/lib/static";
import CameraAndRefresh from "../../shared/camera-and-refresh";
import { cn, modalSlide } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { Close } from "@/components/icons/icons";
import { FullscreenableLiquidationHeatmapChart } from "./fullscreenable-liquidation-heatmap-chart";
import { LiquidationHeatmapFullscreenControls } from "./liquidation-heatmap-fullscreen-controls";
import FullScreenButtonV2 from "../../shared/fullscreen-buttonv2";
import { WidgetWrapper } from "../../shared";

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
}

export default function LiquidationHeatmapWidget(props: IProps) {
  const { widget } = props;
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
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
    error,
  } = useFetchLiquidHeatMapData(widget.props?.period, selectedPair?.value.exchange, selectedPair?.value.symbol);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    if (!isFullscreen) {
      setIsControlsVisible(false);
    }
  };

  const onAnimationComplete = useCallback(() => {
    if (!isFullscreen) {
      setIsControlsVisible(true);
    }
  }, [isFullscreen]);

  const handleSetProp = (key: string, value: any) => {
    updateWidgetPropsFromAtom({
      tabId: activeLayout.id,
      widgetId: widget.id,
      widgetProps: { ...widget.props, [key]: value },
    });
  };

  const handleCoinChange = (coin: string) => {
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
  };

  const handlePairChange = (value: any) => {
    updateWidgetPropsFromAtom({
      tabId: activeLayout.id,
      widgetId: widget.id,
      widgetProps: {
        ...widget.props,
        exchange_token: value.label,
      },
    });
  };

  return (
    <WidgetWrapper widget={widget} title="Liquidation Heatmap" handleLearnMore={() => setShowInfo(true)}>
      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col">
        {/* Controls */}
        <div className={cn("py-2", { "opacity-0": isFullscreen, "opacity-100": !isFullscreen })}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CoinDropdown
              title=""
              options={coinData || []}
              value={widget.props?.token}
              setValue={handleCoinChange}
            />
            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 w-full sm:w-auto">
              <PairDropdown
                options={filteredData}
                value={selectedPair || exchangePairDefault}
                setValue={handlePairChange}
              />
              <PeriodDropdown
                options={liquidHeatMapTimeframeOptions}
                value={widget.props?.period || liquidHeatMapTimeframeOptions[0].value}
                setValue={(value: string) => handleSetProp("period", value)}
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

        {/* Chart Area */}
        <div className={cn("relative flex flex-col", isFullscreen ? "h-full" : "flex-1")} ref={chartRef}>
          {/* Legend */}
          <div className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1 pb-2", { hidden: isFullscreen })}>
            <ChartLegend colorOptions={colorToCfgi} />
          </div>

          <div className="flex-1 px-3">
            <FullscreenableLiquidationHeatmapChart
              isFullscreen={isFullscreen}
              isPending={isFetching}
              error={error}
              liquidationData={liquidationData}
              onAnimationComplete={onAnimationComplete}
            />
          </div>
        </div>
      </div>

      <FullScreenButtonV2 isControlsVisible={isControlsVisible} toggleFullscreen={toggleFullscreen} />

      <AnimatePresence>
        {showInfo && (
          <div className="absolute top-[10px] right-[10px] bottom-[10px] left-[10px] z-[19] flex items-end">
            <motion.div
              className="scrollbar max-h-full overflow-auto rounded-[22px] bg-[#111] px-5 py-4 flex-1"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4 justify-between flex-1 h-full">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <h3 className="text-base leading-[1.35] font-semibold text-white">Liquidation Heatmap</h3>
                    <p className="text-[13px] leading-[1.25] font-light text-neutral-400">
                      Learn about the Liquidation Heatmap
                    </p>
                  </div>
                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    A Liquidation Heatmap is a chart that predicts price levels where large-scale liquidations might
                    occur. When trader&apos;s leveraged positions lack sufficient margin, exchanges forcibly close
                    them, creating these events. The heatmap helps traders identify these high-liquidity zones.
                  </p>
                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    The chart calculates potential liquidation levels using market data for various leverage amounts.
                    As more estimated liquidations are added to a price, the colors change from purple (low
                    concentration) to yellow (high concentration), highlighting areas of high risk and liquidity.
                  </p>
                  <div className="flex flex-col gap-2">
                    <p className="text-[13px] leading-[1.35] font-semibold text-white">How traders can use it:</p>
                    <ul className="list-disc pl-5 space-y-2 text-[13px] font-medium text-white">
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
                  <p className="text-xs font-semibold text-neutral-400 text-[1.25]">
                    We use data from{" "}
                    <a href="https://www.coinglass.com/" target="_blank" className="underline">
                      Coinglass.com
                    </a>
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      className="app_widget_button flex h-[26px] items-center justify-center gap-1 rounded-[40px] bg-[#272727]"
                      onClick={() => setShowInfo(false)}
                    >
                      <p className="app_widget_button__text text-[13px] font-medium whitespace-nowrap text-white">
                        Close
                      </p>
                      <div className="app_widget_button__icon">
                        <Close fill="#878787" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LiquidationHeatmapFullscreenControls
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        coinOptions={coinData || []}
        tokenValue={widget.props?.token}
        setTokenValue={handleCoinChange}
        pairOptions={filteredData}
        pairValue={selectedPair || exchangePairDefault}
        setPairValue={handlePairChange}
        periodOptions={liquidHeatMapTimeframeOptions}
        periodValue={widget.props?.period || liquidHeatMapTimeframeOptions[0].value}
        setPeriodValue={(period) => handleSetProp("period", period)}
      />
    </WidgetWrapper>
  );
}