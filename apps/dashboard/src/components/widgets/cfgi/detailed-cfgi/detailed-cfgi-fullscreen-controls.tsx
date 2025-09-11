"use client";

import React, { Fragment } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { getOverlayRoot } from "@/lib/utils";
import { FullScreen } from "@/components/icons/icons";
import CoinDropdown from "../../shared/coin-dropdown";
import PeriodDropdown from "../../shared/period-dropdown";
import CameraAndRefresh from "../../shared/camera-and-refresh";
import ChartTab from "../../shared/chart-tab";
import { CFGI_SUPPORTED_PERIODS_ENUM, CfgiPeriods } from "@/constant/cfgi-data";
import { useSetAtom, useAtomValue } from "jotai";
import { updateWidgetPropsAtom, LayoutType } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";

interface IProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  widget: LayoutType["widgets"][0];
  coinData: any[];
  isFetching: boolean;
  chartRef: React.RefObject<HTMLDivElement | null>;
  refetch: () => void;
}

export function DetailedCfgiFullscreenControls(props: IProps) {
  const { isFullscreen, toggleFullscreen, widget, coinData, isFetching, chartRef, refetch } = props;

  const overlayRoot = getOverlayRoot();
  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  return (
    <Fragment>
      {overlayRoot &&
        isFullscreen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-auto fixed top-0 right-0 left-0 z-[60] flex items-center justify-between gap-4 bg-black/20 px-4 backdrop-blur-2xl py-2"
            >
              <div className="flex flex-wrap items-center gap-2">
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
              <div className="flex items-center">
                <button
                  onClick={toggleFullscreen}
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-black/40 text-white hover:bg-black/60"
                >
                  <FullScreen />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>,
          overlayRoot,
        )}
    </Fragment>
  );
}
