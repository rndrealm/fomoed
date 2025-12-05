import React, { Fragment } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { getOverlayRoot } from "@/lib/utils";
import { FullScreen } from "@/components/icons/icons";
import CoinDropdown from "../../shared/coin-dropdown";
import PeriodDropdown from "../../shared/period-dropdown";
import ChartTab from "../../shared/chart-tab";
import { CoinDataInterface } from "@/services/queries/charts/types"; 
import { CfgiPeriods } from "@/constant/cfgi-data";

interface IProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  coinOptions: CoinDataInterface[];
  tokenValue?: string;
  setTokenValue: (token: string) => void;
  tabValue?: string;
  setTabValue: (tab: string) => void;
  periodOptions: { label: string; value: string }[];
  periodValue?: string;
  setPeriodValue: (period: string) => void;
  source?: string
}

export function DetailedCfgiFullscreenControls(props: IProps) {
  const {
    isFullscreen,
    toggleFullscreen,
    coinOptions,
    tokenValue,
    setTokenValue,
    tabValue,
    setTabValue,
    periodOptions,
    periodValue,
    setPeriodValue,
    source,
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
              className="pointer-events-auto fixed top-0 right-0 left-0 z-[60] flex items-center justify-between gap-4 bg-black/20 px-4 backdrop-blur-2xl py-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <CoinDropdown
                  options={coinOptions}
                  value={tokenValue}
                  setValue={setTokenValue} 
                  title="Fear and Greed Chart"
                />
                <ChartTab
                  value={tabValue || "both"}
                  setValue={setTabValue} 
                />
                {source && source !== 'coin-stats' && (
                  <PeriodDropdown
                    options={periodOptions}
                    value={periodValue as string}
                    setValue={setPeriodValue} 
                  />
                )}
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