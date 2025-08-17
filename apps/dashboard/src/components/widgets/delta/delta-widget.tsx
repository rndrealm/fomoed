"use client";

import { useFetchOrderbookDelta } from "@/services/queries/charts";
import {
  useGetSupportedxchangePairs,
  useReadCoinList,
} from "@/services/queries/charts";
import CoinDropdown from "../shared/coin-dropdown";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import PeriodDropdown from "../shared/period-dropdown";
import PairDropdown from "../shared/pair-dropdown";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { exchangePairDefault } from "@/lib/static";
import CameraAndRefresh from "../shared/camera-and-refresh";
import { AnimatePresence, motion } from "motion/react";
import { Close, FullScreen, Question } from "@/components/icons/icons";
import { modalSlide, cn, splitWidgetSlug } from "@/lib/utils";
import { FullscreenableDeltaChart } from "./fullscreenable-delta-chart";
import { FullscreenControls } from "./fullscreenable-delta-control";
import { OptionsDropdown } from "../shared/options-dropwdown";
import { settingAtom, updateSettingAtom } from "@/lib/atoms/settingsAtom";
import StarFilled from "@/components/icons/StarFilled";
import Star from "@/components/icons/Star";

const deltaIntervalOptions = [
  { label: "1m", value: "1m" },
  { label: "3m", value: "3m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "30m", value: "30m" },
  { label: "1h", value: "1h" },
  { label: "4h", value: "4h" },
  { label: "6h", value: "6h" },
  { label: "8h", value: "8h" },
  { label: "12h", value: "12h" },
  { label: "1d", value: "1d" },
  { label: "1w", value: "1w" },
];

const deltaRangeOptions = [
  { label: "±0.25%", value: "0.25" },
  { label: "±0.5%", value: "0.5" },
  { label: "±0.75%", value: "0.75" },
  { label: "±1%", value: "1" },
  { label: "±2%", value: "2" },
  { label: "±3%", value: "3" },
  { label: "±5%", value: "5" },
  { label: "±10%", value: "10" },
];

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function OrderbookDeltaWidget(props: IProps) {
  const { widget } = props;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const { data: coinData } = useReadCoinList();
  const { data: pairsData } = useGetSupportedxchangePairs();
  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);
  
  const settings = useAtomValue(settingAtom);
  const updateSettings = useSetAtom(updateSettingAtom);
  const widgetSlug = splitWidgetSlug(widget.meta.i).slug;

  const selectedPair = useMemo(() => {
    return pairsData.find((pr) => pr.label === widget.props?.exchange_token);
  }, [pairsData, widget.props?.exchange_token]);

  useEffect(() => {
    if (
      !pairsData?.length ||
      (widget.props?.exchange_token &&
        widget.props?.interval &&
        widget.props?.range)
    )
      return;

    updateWidgetPropsFromAtom({
      tabId: activeLayout.id,
      widgetId: widget.id,
      widgetProps: {
        ...widget.props,
        exchange_token: widget.props?.exchange_token || pairsData[0].label,
        interval: widget.props?.interval || deltaIntervalOptions[5].value,
        range: widget.props?.range || deltaRangeOptions[3].value,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pairsData,
    widget.id,
    widget.props?.exchange_token,
    widget.props?.interval,
    widget.props?.range,
    activeLayout.id,
    updateWidgetPropsFromAtom,
  ]);

  const filteredData = useMemo(() => {
    if (!pairsData) return [];
    return pairsData.filter((i) => i.value.base_asset === widget.props?.token);
  }, [pairsData, widget.props?.token]);

  const {
    data: chartData,
    isFetching,
    isPending,
    error,
    refetch,
  } = useFetchOrderbookDelta(
    selectedPair?.value.exchange || "",
    selectedPair?.value.symbol || "",
    widget.props?.interval || "",
    widget.props?.range || "",
  );

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
      <div className="flex flex-col gap-0 ">
        <div className="flex cursor-grab justify-center pt-4 pb-1">
          <div className="h-[5px] w-[36px] rounded-[2px] bg-[#444]"></div>
        </div>

        <div className="flex flex-col">
          <div className="mb-1 flex items-center justify-between px-4">
            <p className="font-semibold text-base leading-[1.35] text-[#878787]">
              {`${widget.props?.token || ""} Delta Spread`}
            </p>
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
      </div>
      <div className="relative flex flex-1 flex-col px-4" ref={chartRef}>
        <div className="flex items-center justify-between" >
            <div className="flex items-center gap-2">
                <CoinDropdown
                options={coinData || []}
                value={widget.props?.token}
                setValue={(coin: string) => {
                    const newPairs = pairsData.filter(
                    (i) => i.value.base_asset === coin,
                    );
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
                title=""
                />
                {/* <PairDropdown
                options={filteredData}
                value={selectedPair || exchangePairDefault}
                setValue={(value) => handleSetProp("exchange_token", value.label)}
                /> */}
            </div>
            <div className="flex items-center gap-2">
                <PeriodDropdown
                    options={deltaIntervalOptions}
                    value={widget.props?.interval}
                    setValue={(value: string) => handleSetProp("interval", value)}
                />
                <PeriodDropdown
                    options={deltaRangeOptions}
                    value={widget.props?.range}
                    setValue={(value: string) => handleSetProp("range", value)}
                />
                <div className="flex items-center gap-2" data-html2canvas-ignore>
                    <CameraAndRefresh
                        isFetching={isFetching}
                        chartRef={chartRef}
                        file="Orderbook Delta Chart.png"
                        refetch={refetch}
                    />
                </div>
            </div>
        </div>
        <div className="relative flex flex-1 pt-2" ref={chartRef}>
            <FullscreenableDeltaChart
                isFullscreen={isFullscreen}
                chartData={chartData}
                isPending={isPending || isFetching}
                error={error}
                onAnimationComplete={onAnimationComplete}
            />
        </div>
      </div>

      <div
        className={cn(
          "absolute right-[9px] bottom-[16px] z-[9] h-[28px] w-[28px] rounded-md border border-[#1c1c1c]",
          { "opacity-0": !isControlsVisible, "opacity-100": isControlsVisible }
        )}
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

      <AnimatePresence>
        {showInfo && (
          <div className="absolute top-[10px] right-[10px] bottom-[10px] left-[10px] z-[19] flex items-end">
            <motion.div
              className="scrollbar h-full overflow-auto rounded-[22px] bg-[#111] px-5 py-4 flex-1"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4 justify-between flex-1 h-full">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <h3 className="text-base leading-[1.35] font-semibold text-white">{`${widget.props?.token || ""} Delta Spread`}</h3>
                  </div>
                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    Orderbook Delta measures the difference between buying and selling pressure within a specific range of the order book. A positive delta (green bars) indicates more buying interest, while a negative delta (red bars) suggests stronger selling pressure. Traders use this to gauge immediate market sentiment and potential short-term price movements.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold text-[#696969] text-[1.25]">
                    We use data from{" "}
                    <a href="https://www.coinglass.com/" target="_blank" className="underline">Coinglass.com</a>
                  </p>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      className="app_widget_button flex h-[26px] items-center justify-center gap-1 rounded-[40px] bg-[#272727]"
                      onClick={() => setShowInfo(false)}
                    >
                      <p className="app_widget_button__text text-[13px] font-medium whitespace-nowrap text-white">Close</p>
                      <div className="app_widget_button__icon"><Close fill="#878787" /></div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <FullscreenControls
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        coinOptions={coinData || []}
        tokenValue={widget.props?.token}
        setTokenValue={(coin: string) => {
          const newPairs = pairsData.filter((i) => i.value.base_asset === coin);
          handleSetProp("token", coin);
          if (newPairs.length > 0) {
            handleSetProp("exchange_token", newPairs[0].label);
          }
        }}
        pairOptions={filteredData}
        pairValue={selectedPair}
        setPairValue={(pair) => handleSetProp("exchange_token", pair.label)}
        intervalOptions={deltaIntervalOptions}
        intervalValue={widget.props?.interval}
        setIntervalValue={(interval) => handleSetProp("interval", interval)}
        rangeOptions={deltaRangeOptions}
        rangeValue={widget.props?.range}
        setRangeValue={(range) => handleSetProp("range", range)}
      />
    </div>
  );
}
