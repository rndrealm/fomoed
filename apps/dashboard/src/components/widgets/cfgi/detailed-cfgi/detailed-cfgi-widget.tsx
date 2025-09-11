"use client";

import { useReadCfgiData, useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "../../shared/coin-dropdown";
import { useCallback, useMemo, useRef, useState } from "react";
import PeriodDropdown from "../../shared/period-dropdown";
import { CFGI_SUPPORTED_PERIODS_ENUM, CfgiPeriods } from "@/constant/cfgi-data";
import { Skeleton } from "@/components/ui/skeleton";
import ChartLegend from "../../shared/chart-legend";
import DetailedCfgiChart from "./detailed-cfgi-chart";
import ChartTab from "../../shared/chart-tab";
import { cn, modalSlide } from "@/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import CameraAndRefresh from "../../shared/camera-and-refresh";
import { WidgetWrapper } from "../../shared"; // Make sure this import is correct
import { AnimatePresence, motion } from "motion/react";
import { Close, FullScreen } from "@/components/icons/icons";
import { DetailedCfgiFullscreenControls } from "./detailed-cfgi-fullscreen-controls"; // Import the new component

const colorToCfgi = [
  { label: "0-25", color: "#FF3B10" },
  { label: "25-50", color: "#EA9924" },
  { label: "50-75", color: "#399F57" },
  { label: "75-100", color: "#05A5A6" },
];

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function DetailedCfgiWidget(props: IProps) {
  const { widget } = props;
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);

  const { data: coinData } = useReadCoinList();
  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  const activeCoinSlug = useMemo(() => {
    return coinData?.find((coin) => coin.symbol === widget.props?.token)?.slug;
  }, [widget.props?.token, coinData]);

  const { data, refetch, isFetching } = useReadCfgiData(widget.props?.token, widget.props?.period, activeCoinSlug);

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

  return (
    <>
      <WidgetWrapper widget={widget} title="Detailed CFGI" handleLearnMore={() => setShowInfo(true)}>
        <div className={cn("relative flex h-full w-full flex-col", isFullscreen && "py-[60px]")} ref={chartRef}>
          {!isFullscreen && coinData && (
            <div className="py-2">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <CoinDropdown
                  options={coinData || []}
                  value={widget.props?.token}
                  setValue={(coin: string) => {
                    updateWidgetPropsFromAtom({
                      tabId: activeLayout.id,
                      widgetId: widget.id,
                      widgetProps: { ...widget.props, token: coin },
                    });
                  }}
                  title="Fear and Greed Chart"
                />
                <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
                  <ChartTab
                    value={widget.props?.sentiment_tab || "both"}
                    setValue={(val) => {
                      updateWidgetPropsFromAtom({
                        tabId: activeLayout.id,
                        widgetId: widget.id,
                        widgetProps: { ...widget.props, sentiment_tab: val },
                      });
                    }}
                  />
                  <PeriodDropdown
                    options={CfgiPeriods}
                    value={widget.props?.period || (CFGI_SUPPORTED_PERIODS_ENUM.DAY1 as string)}
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
                    file="Detailed Fear and Greed Chart.png"
                    refetch={refetch}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex h-full w-full flex-col">
            <div className={cn("flex-grow", isFullscreen && "pt-[60px]")}>
              {data && !isFetching ? (
                <DetailedCfgiChart
                  isFullscreen={isFullscreen}
                  cfgiData={data}
                  viewOption={widget.props?.sentiment_tab || "both"}
                  onAnimationComplete={onAnimationComplete} // Pass this down if the chart library supports it
                />
              ) : (
                <Skeleton className="bg-widget-background-200 h-full w-full" />
              )}
            </div>
            <div className="flex items-center justify-center gap-5 py-2">
              <ChartLegend colorOptions={colorToCfgi} />
            </div>
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
                      <h3 className="text-base leading-[1.35] font-semibold">Detailed CFGI</h3>
                      <p className="text-[13px] leading-[1.25] font-light text-neutral-400">
                        Learn about the Crypto Fear & Greed Index
                      </p>
                    </div>
                    <p className="text-[13px] leading-[1.35] font-medium">
                      The Crypto Fear & Greed Index (CFGI) provides a daily snapshot of market sentiment. A score of 0
                      (&quot;Extreme Fear&quot;) suggests investors are overly worried, which could be a buying
                      opportunity. A score of 100 (&quot;Extreme Greed&quot;) indicates the market is likely due for a
                      correction.
                    </p>
                    <p className="text-[13px] leading-[1.35] font-medium">
                      This chart visualizes the historical CFGI data, allowing you to see how sentiment has fluctuated
                      over time in relation to price action. By analyzing these trends, traders can better gauge market
                      bottoms and tops.
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

      <DetailedCfgiFullscreenControls
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        widget={widget}
        coinData={coinData || []}
        isFetching={isFetching}
        chartRef={chartRef}
        refetch={refetch}
      />

      <div
        className={cn("absolute right-[9px] bottom-[16px] z-[9] h-[28px] w-[28px] rounded-md border border-[#1c1c1c]", {
          "opacity-0": !isControlsVisible,
          "opacity-100": isControlsVisible,
        })}
        style={{
          background: "linear-gradient(180deg, #1b1b1b 0%, rgba(0, 0, 0, 0.38) 72.15%)",
          backdropFilter: "blur(7px)",
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <button className="flex h-full w-full items-center justify-center" onClick={toggleFullscreen}>
          <FullScreen />
        </button>
      </div>
    </>
  );
}
