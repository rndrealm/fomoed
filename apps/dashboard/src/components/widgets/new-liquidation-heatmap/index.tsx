"use client";
import React, { useState } from "react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { WidgetWrapper } from "../shared";
import App from "./App";
import { AnimatePresence, motion } from "motion/react";
import { Close } from "@/components/icons/icons";
import { modalSlide } from "@/lib/utils";

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function NewLiquidationHeatmap(props: IProps) {
  const { widget } = props;
  const [showInfo, setShowInfo] = useState(false);

  return (
    <WidgetWrapper title="Liquidation Heatmap" widget={widget} handleLearnMore={() => setShowInfo(true)}>
      <App />

      {/* Learn More Modal */}
      <AnimatePresence>
        {showInfo && (
          <div className="absolute top-[10px] right-[10px] bottom-[10px] left-[10px] z-[100] flex items-end">
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
                      Visualize where liquidations are clustered
                    </p>
                  </div>

                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    This Liquidation Heatmap is inspired by the Coinglass Liquidation Heatmap and is based on an
                    open-source model. We extend the original logic by adding additional data layers such as VWAP to
                    provide better market context.
                  </p>

                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    <strong>How it works:</strong> Each main candle is divided into smaller intrabar segments (subbars)
                    using a configurable intrabar resolution. For each bar, the script evaluates subbars with a positive
                    Open Interest Delta (OID). When “Filter by Signal” is enabled, only subbars belonging to a bar with
                    a peak in open interest are considered.
                  </p>

                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    Based on intrabar price movement, the script estimates where long and short positions are opened. A
                    dispersion factor is used to distribute positions within the bar (this is unnecessary when using
                    tick-level intrabar data, where dispersion can be set to zero).
                  </p>

                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    Using user-selected leverage levels, the liquidation price for each estimated position is
                    calculated. Each liquidation level has a fixed price width, and the intrabar OID is used as a proxy
                    for the number of contracts at risk. Color intensity reflects the relative magnitude of estimated
                    liquidations.
                  </p>

                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    If additional liquidation estimates occur at an existing level, the script accumulates the values
                    and updates the level’s intensity. Unlike Coinglass, which only brightens the level from the moment
                    of increase, this implementation repaints the entire level.
                  </p>

                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    <strong>Additional context:</strong> VWAP is overlaid to help identify fair value and contextualize
                    liquidation clusters relative to current market positioning.
                  </p>

                  <div className="bg-[#1a1a1a] border border-[#272727] rounded-lg p-3">
                    <p className="text-xs font-medium text-yellow-400 mb-1">⚠️ Important Note</p>
                    <p className="text-xs text-neutral-400 leading-[1.4]">
                      This heatmap is an estimate, not a direct feed of actual liquidation orders. It relies on
                      assumptions about leverage usage and position distribution. While useful for understanding
                      potential liquidity zones, it should be used as a proxy and not as a source of exact liquidation
                      levels.
                    </p>
                  </div>
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
    </WidgetWrapper>
  );
}
