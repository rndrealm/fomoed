"use client";

import React, { Fragment } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { getOverlayRoot } from "@/lib/utils";
import { FullScreen } from "@/components/icons/icons";
import CoinDropdown from "../../shared/coin-dropdown";
import PairDropdown from "../../shared/pair-dropdown";
import PeriodDropdown from "../../shared/period-dropdown";
import CameraAndRefresh from "../../shared/camera-and-refresh";
import { liquidTimeframeOptions } from "@/constant/cfgi-data";
import { exchangePairDefault } from "@/lib/static";
import { useSetAtom, useAtomValue } from "jotai";
import { updateWidgetPropsAtom, LayoutType } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";

interface IProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  widget: LayoutType["widgets"][0];
  coinData: any[];
  filteredData: any[];
  selectedPair: any;
  pairsData: any[];
  isFetching: boolean;
  chartRef: React.RefObject<HTMLDivElement | null>;
  refetch: () => void;
}

export function LiquidationFullscreenControls(props: IProps) {
  const {
    isFullscreen,
    toggleFullscreen,
    widget,
    coinData,
    filteredData,
    selectedPair,
    pairsData,
    isFetching,
    chartRef,
    refetch,
  } = props;

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
                        exchange_token: newPairs.length > 0 ? newPairs[0].label : "",
                      },
                    });
                  }}
                />
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