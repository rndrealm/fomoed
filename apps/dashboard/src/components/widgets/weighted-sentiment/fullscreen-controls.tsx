import React, { Fragment } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { RenderIf } from "@/components/shared";
import { getOverlayRoot } from "@/lib/utils";
import { FullScreen } from "@/components/icons/icons";
import SanitmentTokenDropdown from "../shared/santiment-token-dropdown";
import { WeightedSentimentToken } from "@/services/queries/santiment/types";
import PeriodDropdown from "../shared/period-dropdown";
import { OptionsType } from "@/constant/cfgi-data";

interface IProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  options: WeightedSentimentToken[];
  tokenValue?: string;
  setTokenValue: (coin: string) => void;
  periodOptions: OptionsType[];
  periodValue: string;
  setPeriodValue: (period: string) => void;
}

export function FullscreenControls(props: IProps) {
  const {
    isFullscreen,
    toggleFullscreen,
    options,
    setTokenValue,
    tokenValue,
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
              className="pointer-events-auto fixed top-0 right-0 left-0 z-[60] flex items-center justify-between bg-black/20 px-2 backdrop-blur-2xl py-2"
            >
              <div className="">
                <SanitmentTokenDropdown
                  options={options}
                  setValue={(coin: string) => {
                    setTokenValue(coin);
                  }}
                  value={tokenValue}
                />
              </div>
              <div className="flex gap-4 items-center">
                <PeriodDropdown
                  options={periodOptions}
                  value={periodValue}
                  setValue={(value: string) => {
                    setPeriodValue(value);
                  }}
                  triggerClassName="h-6 w-15"
                />
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
