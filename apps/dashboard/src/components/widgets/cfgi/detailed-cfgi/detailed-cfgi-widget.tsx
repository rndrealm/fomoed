"use client";

import { useReadCfgiData, useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "../../shared/coin-dropdown";
import { useCallback, useMemo, useRef, useState } from "react";
import PeriodDropdown from "../../shared/period-dropdown";
import { CfgiPeriods } from "@/constant/cfgi-data";
import ChartLegend from "../../shared/chart-legend";
import ChartTab from "../../shared/chart-tab";
import { cn, modalSlide, splitWidgetSlug } from "@/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import CameraAndRefresh from "../../shared/camera-and-refresh";
import { AnimatePresence, motion } from "motion/react";
import { Close, FullScreen, Question } from "@/components/icons/icons";
import { DetailedCfgiFullscreenControls } from "./detailed-cfgi-fullscreen-controls";
import { FullscreenableCfgiChart } from "./fullscreenable-cfgi-chart";
import { OptionsDropdown } from "../../shared/options-dropwdown";
import { settingAtom, updateSettingAtom } from "@/lib/atoms/settingsAtom";
import StarFilled from "@/components/icons/StarFilled";
import Star from "@/components/icons/Star";
import FullScreenButtonV2 from "../../shared/fullscreen-buttonv2";

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

  const settings = useAtomValue(settingAtom);
  const updateSettings = useSetAtom(updateSettingAtom);
  const widgetSlug = splitWidgetSlug(widget.meta.i).slug;

  const activeCoinSlug = useMemo(() => {
    return coinData?.find((coin) => coin.symbol === widget.props?.token)?.slug;
  }, [widget.props?.token, coinData]);

  const { data, refetch, isFetching, error, source } = useReadCfgiData(
    widget.props?.token,
    widget.props?.period,
    activeCoinSlug,
  );

  if (error) {
    const message = error.message || "Unexpected error occurred";
    throw new Error(`CFGI data request failed - ${message}`);
  }

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

  return (
    <div className="relative flex h-full flex-col gap-0 rounded-2xl bg-[#000] pt-0 pb-2">
      {/* NEW: Header and Options section from Wrapper */}
      <div className="flex flex-col gap-0">
        <div className="flex cursor-grab justify-center pt-4 pb-1">
          <div className="h-[5px] w-[36px] rounded-[2px] bg-[#444]"></div>
        </div>
        <div className="mb-1 flex items-center justify-between px-4">
          <p className="font-semibold text-base leading-[1.35] text-[#878787]">Fear and Greed Chart</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const isFavorite = settings.favorite_widgets.includes(widgetSlug);
                const newWidgetArray: string[] = isFavorite
                  ? settings.favorite_widgets.filter((item) => item !== widgetSlug)
                  : [...settings.favorite_widgets, widgetSlug];
                updateSettings({ ...settings, favorite_widgets: newWidgetArray });
              }}
            >
              {settings.favorite_widgets.includes(widgetSlug) ? <StarFilled /> : <Star />}
            </button>
            <button type="button" onClick={() => setShowInfo(true)}>
              <Question />
            </button>
            <OptionsDropdown widget={widget} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col px-4">
        {/* Controls */}
        <div className={cn("py-2", { "opacity-0": isFullscreen, "opacity-100": !isFullscreen })}>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <CoinDropdown
              options={coinData || []}
              value={widget.props?.token}
              setValue={(coin: string) => handleSetProp("token", coin)}
              title=""
            />
            <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
              <ChartTab
                value={widget.props?.sentiment_tab || "both"}
                setValue={(val) => handleSetProp("sentiment_tab", val)}
              />
              {source && source !== 'coin-stats' && (
                <PeriodDropdown
                  options={CfgiPeriods}
                  value={widget.props?.period}
                  setValue={(value: string) => handleSetProp("period", value)}
                />
              )}
              <CameraAndRefresh
                isFetching={isFetching}
                chartRef={chartRef}
                file="Detailed Fear and Greed Chart.png"
                refetch={refetch}
              />
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className={cn("relative", isFullscreen ? "h-full" : "flex-grow")} ref={chartRef}>
          <FullscreenableCfgiChart
            isFullscreen={isFullscreen}
            isPending={isFetching}
            error={error}
            cfgiData={data}
            viewOption={widget.props?.sentiment_tab || "both"}
            onAnimationComplete={onAnimationComplete}
          />
        </div>

        {/* Legend */}
        <div className={cn("flex items-center justify-center gap-5 py-2", { hidden: isFullscreen })}>
          <ChartLegend colorOptions={colorToCfgi} />
        </div>
      </div>

      {/* Fullscreen Button */}
      <FullScreenButtonV2 isControlsVisible={isControlsVisible} toggleFullscreen={toggleFullscreen} />

      {/* Info Modal */}
      {/* Info Modal */}
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
                    <h3 className="text-base leading-[1.35] font-semibold text-white">Fear and Greed Chart</h3>
                    <p className="text-[13px] leading-[1.25] font-light text-neutral-400">
                      Learn about the Crypto Fear & Greed Index
                    </p>
                  </div>
                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    The Crypto Fear & Greed Index (CFGI) provides a daily snapshot of market sentiment. A score of 0
                    (&quot;Extreme Fear&quot;) suggests investors are overly worried, which could be a buying
                    opportunity. A score of 100 (&quot;Extreme Greed&quot;) indicates the market is likely due for a
                    correction.
                  </p>
                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    This chart visualizes the historical CFGI data, allowing you to see how sentiment has fluctuated
                    over time in relation to price action. By analyzing these trends, traders can better gauge market
                    bottoms and tops.
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

      {/* Fullscreen Controls Portal */}
      <DetailedCfgiFullscreenControls
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        coinOptions={coinData || []}
        tokenValue={widget.props?.token}
        setTokenValue={(coin) => handleSetProp("token", coin)}
        tabValue={widget.props?.sentiment_tab}
        setTabValue={(tab) => handleSetProp("sentiment_tab", tab)}
        periodOptions={CfgiPeriods}
        periodValue={widget.props?.period}
        setPeriodValue={(period) => handleSetProp("period", period)}
      />
    </div>
  );
}
