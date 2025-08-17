import React, { Fragment } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn, getOverlayRoot } from "@/lib/utils";
import { FullScreen } from "@/components/icons/icons";
import CoinDropdown from "../shared/coin-dropdown";
import PairDropdown from "../shared/pair-dropdown";
import PeriodDropdown from "../shared/period-dropdown";
import { CoinDataInterface, ExchangePairOption } from "@/services/queries/charts/types";

interface IProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  
  // Token Controls
  coinOptions: CoinDataInterface[];
  tokenValue?: string;
  setTokenValue: (token: string) => void;

  // Pair Controls
  pairOptions: ExchangePairOption[];
  pairValue?: ExchangePairOption;
  setPairValue: (pair: ExchangePairOption) => void;

  // Interval Controls
  intervalOptions: { label: string; value: string }[];
  intervalValue?: string;
  setIntervalValue: (interval: string) => void;

  // Range Controls
  rangeOptions: { label: string; value: string }[];
  rangeValue?: string;
  setRangeValue: (range: string) => void;
}

export function FullscreenControls(props: IProps) {
  const {
    isFullscreen,
    toggleFullscreen,
    coinOptions,
    tokenValue,
    setTokenValue,
    pairOptions,
    pairValue,
    setPairValue,
    intervalOptions,
    intervalValue,
    setIntervalValue,
    rangeOptions,
    rangeValue,
    setRangeValue,
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
              className="pointer-events-auto fixed top-0 right-0 left-0 z-[60] flex items-center justify-between bg-black/20 px-4 backdrop-blur-2xl py-2"
            >
              <div className="flex items-center gap-2">
                <CoinDropdown
                  options={coinOptions}
                  value={tokenValue}
                  setValue={setTokenValue}
                  title=""
                />
                {/* <PairDropdown
                  options={pairOptions}
                  value={pairValue}
                  setValue={setPairValue}
                /> */}
                <PeriodDropdown
                  options={intervalOptions}
                  value={intervalValue || ""}
                  setValue={setIntervalValue}
                />
                <PeriodDropdown
                  options={rangeOptions}
                  value={rangeValue || ""}
                  setValue={setRangeValue}
                />
              </div>
              <div className="flex gap-4 items-center">
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
