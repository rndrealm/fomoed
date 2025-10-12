import React, { Fragment } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { getOverlayRoot } from "@/lib/utils";
import { FullScreen } from "@/components/icons/icons";
import CoinDropdown from "../../shared/coin-dropdown";
import PairDropdown from "../../shared/pair-dropdown";
import PeriodDropdown from "../../shared/period-dropdown";
import { CoinDataInterface } from "@/services/queries/charts/types";

interface IProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  coinOptions: CoinDataInterface[];
  tokenValue?: string;
  setTokenValue: (token: string) => void;
  pairOptions: any[];
  pairValue: any;
  setPairValue: (pair: any) => void;
  periodOptions: { label: string; value: string }[];
  periodValue: string;
  setPeriodValue: (period: string) => void;
}

export function LiquidationHeatmapFullscreenControls(props: IProps) {
  const {
    isFullscreen,
    toggleFullscreen,
    coinOptions,
    tokenValue,
    setTokenValue,
    pairOptions,
    pairValue,
    setPairValue,
    periodOptions,
    periodValue,
    setPeriodValue,
  } = props;

  const overlayRoot = getOverlayRoot();

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
              className="pointer-events-auto fixed top-0 right-0 left-0 z-[60] flex items-center justify-between gap-4 bg-black/20 px-4 backdrop-blur-2xl py-1.5 h-14"
            >
              <div className="flex flex-wrap items-center gap-2">
                <CoinDropdown
                  options={coinOptions}
                  value={tokenValue}
                  setValue={setTokenValue}
                  title="Liquidation Heatmap"
                />
                <PairDropdown
                  options={pairOptions}
                  value={pairValue}
                  setValue={setPairValue}
                />
                <PeriodDropdown
                  options={periodOptions}
                  value={periodValue}
                  setValue={setPeriodValue}
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