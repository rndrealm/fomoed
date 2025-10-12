"use client";
import React, { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { settingAtom, updateSettingAtom } from "@/lib/atoms/settingsAtom";
import { cn, splitWidgetSlug, getOverlayRoot, modalSlide } from "@/lib/utils";
import StarFilled from "@/components/icons/StarFilled";
import Star from "@/components/icons/Star";
import { Close, FullScreen, Question, Weight } from "@/components/icons/icons";
import { OptionsDropdown } from "../shared/options-dropwdown";
import PeriodDropdown from "../shared/period-dropdown";
import { useReadSantimentTokenList } from "@/services/queries/santiment";
import SanitmentTokenDropdown from "../shared/santiment-token-dropdown";
import { FullscreenableChart } from "./fullscreenable-chart";
import { FullscreenControls } from "./fullscreen-controls";
import { useSupabaseAuth } from "@/components/providers";
import FullScreenButtonV2 from "../shared/fullscreen-buttonv2";

const pricePeriodOptions = [
  { value: "5m", label: "5M" },
  { value: "1h", label: "1H" },
  { value: "8h", label: "8H" },
  { value: "1d", label: "1D" },
];

interface IProps {
  widget: LayoutType["widgets"][0];
}

// This component is replaced by the new FullscreenableChart component

export default function WeightedSentiment(props: IProps) {
  const { widget } = props;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const { session } = useSupabaseAuth();
  const overlayRoot = getOverlayRoot();

  const { data: tokenList = [] } = useReadSantimentTokenList({
    auth_token: session?.access_token,
  });

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  const settings = useAtomValue(settingAtom);
  const updateSettings = useSetAtom(updateSettingAtom);

  const widgetSlug = splitWidgetSlug(widget.meta.i).slug;

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);

    if (!isFullscreen) {
      setIsControlsVisible(false);
    }
  };

  const handleSetToken = (coin: string) => {
    updateWidgetPropsFromAtom({
      tabId: activeLayout.id,
      widgetId: widget.id,
      widgetProps: {
        ...widget.props,
        token: coin,
      },
    });
  };

  const handleSetPeriod = (value: string) => {
    updateWidgetPropsFromAtom({
      tabId: activeLayout.id,
      widgetId: widget.id,
      widgetProps: { ...widget.props, period: value },
    });
  };

  const onAnimationComplete = useCallback(() => {
    if (!isFullscreen) {
      setIsControlsVisible(true);
    }
  }, [isFullscreen]);

  return (
    <div className="relative flex h-full flex-col gap-0 rounded-2xl bg-[#000] pt-0 pb-2">
      <div className="flex flex-col gap-0 ">
        <div className="flex cursor-grab justify-center pt-4 pb-1">
          <div className="h-[5px] w-[36px] rounded-[2px] bg-[#444]"></div>
        </div>

        <div className="flex flex-col">
          <div className="mb-1 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="w-[20px] h-[20px] flex items-center justify-center">
                <Weight />
              </div>
              <p className="font-semibold text-base leading-[1.35] text-[#878787]">Weighted Sentiment</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const isFavorite = settings.favorite_widgets.includes(widgetSlug);

                  let newWidgetArray: string[] = [];

                  if (isFavorite) {
                    newWidgetArray = settings.favorite_widgets.filter((item) => item !== widgetSlug);
                  } else {
                    newWidgetArray = [...settings.favorite_widgets, widgetSlug];
                  }
                  updateSettings({
                    ...settings,
                    favorite_widgets: newWidgetArray,
                  });
                }}
              >
                {settings.favorite_widgets.includes(widgetSlug) ? (
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [-30, 30, -15, 15, 0] }}
                    transition={{
                      duration: 1,
                      times: [0, 0.2, 0.4, 0.8, 1],
                    }}
                  >
                    <StarFilled />
                  </motion.div>
                ) : (
                  <Star />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowInfo(true);
                }}
              >
                <Question />
              </button>
              <OptionsDropdown widget={widget} />
            </div>
          </div>
          <div className="px-4">
            <SanitmentTokenDropdown
              options={tokenList}
              setValue={(coin: string) => {
                handleSetToken(coin);
              }}
              value={widget?.props?.token}
            />
          </div>
        </div>
      </div>
      <div className="relative flex flex-1 ">
        <div className="absolute top-[4px] right-0 left-0 z-[9]">
          <div className="flex items-center justify-between px-4 pt-3">
            <div className=""></div>
            {/* <LivePrice token={widget?.props?.token} /> */}

            <div className="flex items-center gap-2">
              <PeriodDropdown
                options={pricePeriodOptions}
                value={widget?.props?.period}
                setValue={(value: string) => {
                  handleSetPeriod(value);
                }}
                triggerClassName="h-6 w-15"
              />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 bottom-0 left-0">
          <FullscreenableChart
            isFullscreen={isFullscreen}
            token={widget?.props?.token}
            period={widget?.props?.period}
            onAnimationComplete={onAnimationComplete}
          />
        </div>
      </div>

      <FullScreenButtonV2 isControlsVisible={isControlsVisible} toggleFullscreen={toggleFullscreen} />

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
                    <h3 className="text-base leading-[1.35] font-semibold text-white">Weighted Sentiment Chart</h3>
                    <p className="text-[13px] leading-[1.25] font-light text-[#878787]">
                      Learn about the Weighted Sentiment Chart
                    </p>
                  </div>
                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    Visualizes market sentiment by weighing bullish and bearish opinions based on their source’s
                    influence, giving a more accurate view of crowd conviction than raw sentiment counts.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold text-[#696969] text-[1.25]">
                    We use data from{" "}
                    <a href="https://santiment.net/" target="_blank">
                      Santiment.net
                    </a>
                  </p>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      className="app_widget_button flex h-[26px] items-center justify-center gap-1 rounded-[40px] bg-[#272727]"
                      onClick={() => {
                        setShowInfo(false);
                      }}
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

      {/* Fullscreen Controls */}
      <FullscreenControls
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        options={tokenList}
        setTokenValue={(coin: string) => {
          handleSetToken(coin);
        }}
        tokenValue={widget?.props?.token}
        periodOptions={pricePeriodOptions}
        periodValue={widget?.props?.period}
        setPeriodValue={(period) => {
          handleSetPeriod(period);
        }}
      />
    </div>
  );
}
