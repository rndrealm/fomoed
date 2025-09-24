"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAtomValue, useSetAtom } from "jotai";

import { LayoutType } from "@/lib/atoms/layoutAtom";
import { settingAtom, updateSettingAtom } from "@/lib/atoms/settingsAtom";
import { cn, splitWidgetSlug, modalSlide } from "@/lib/utils";
import CignalsChartComp from "./cignals-chart";

import StarFilled from "@/components/icons/StarFilled";
import Star from "@/components/icons/Star";
import { Close, Question, LineChart } from "@/components/icons/icons";
import { OptionsDropdown } from "../shared/options-dropwdown";

interface IProps {
  widget: LayoutType["widgets"][0];
}

const CignalsWidget = (props: IProps) => {
  const { widget } = props;
  const [showInfo, setShowInfo] = useState(false);

  const settings = useAtomValue(settingAtom);
  const updateSettings = useSetAtom(updateSettingAtom);

  const widgetSlug = splitWidgetSlug(widget.meta.i).slug;

  return (
    <div className="relative flex h-full flex-col gap-0 rounded-2xl bg-[#000] pt-0 pb-2">
      {/* Header */}
      <div className="flex flex-col gap-0">
        <div className="flex cursor-grab justify-center pt-4 pb-1">
          <div className="h-[5px] w-[36px] rounded-[2px] bg-[#444]"></div>
        </div>

        <div className="mb-1 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              <LineChart />
            </div>{" "}
            <p className="font-semibold text-base leading-[1.35] text-[#878787]">Cignals</p>
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
      </div>

      {/* Chart Component */}
      <div className="relative flex-1 px-4">
        <CignalsChartComp widget={widget} />
      </div>

      {/* Info Panel Overlay */}
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
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <h3 className="text-base leading-[1.35] font-semibold text-white">About Cignals (Footprint Chart)</h3>
                    <p className="text-[13px] leading-[1.25] font-light text-[#878787]">
                      Gain a Professional Trading Edge
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 text-[13px] leading-[1.45] font-medium text-white">
                    <p>
                      Cignals is a powerful suite of professional-grade tools designed to look &quot;under the
                      hood&quot; of the market. It moves beyond simple price charts to reveal the underlying order flow,
                      showing you the real-time actions of market makers and whales so you can trade with a true
                      informational edge.
                    </p>
                    <p>
                      <strong>Uncover Action Inside the Candles:</strong> With{" "}
                      <strong>Footprint and Volume Cluster</strong> charts, you can dissect each candle to see precisely
                      where the volume was traded. Identify the Point of Control (POC), spot areas of absorption, and
                      understand the buy/sell pressure at every price level.
                    </p>
                    <p>
                      <strong>Track Institutional Activity:</strong> Our advanced <strong>Delta indicators</strong> show
                      the net difference between buying and selling volume, revealing the true intentions of the
                      &quot;smart money.&quot; See where large institutions are aggressively trading to position
                      yourself alongside their moves.
                    </p>
                    <p>
                      <strong>Master the Live Order Book:</strong> The ultra-fast <strong>Depth of Market (DOM)</strong>{" "}
                      gives you a live view of liquidity. Pinpoint where large orders are resting and watch for
                      &quot;pulling&quot; and &quot;stacking&quot; to gauge market sentiment and identify key levels.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center mt-4">
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CignalsWidget;
