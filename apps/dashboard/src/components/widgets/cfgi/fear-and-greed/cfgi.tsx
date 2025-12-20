"use client";
import React, { useMemo, useState } from "react";
import { Close } from "@/components/icons/icons";
import { AnimatePresence, motion } from "motion/react";
import { modalSlide } from "@/lib/utils";
import { Progress } from "./progress";
// COMMENTED OUT: Old CFGI.io import (replaced with Alternative.me)
// import { useFetchFearAndGreed, useReadCoinList, useReadFearAndGridFromDb } from "@/services/queries/charts";
import {
  useFetchAlternativeMeFearAndGreed,
  useReadCoinList,
  // useReadFearAndGridFromDb,
} from "@/services/queries/charts";
import CoinStatsTokenDropdown from "../../shared/coin-stats-token-dropdown";
import { tokenArray } from "./tokenArray";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { WidgetWrapper } from "../../shared";

const colors = ["#FF004D", "#FF540B", "#FFD600", "#90FF00", "#03EBF3", "#03EBF3"];

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function CFGI(props: IProps) {
  const { widget } = props;
  const [showInfo, setShowInfo] = useState(false);

  const { data: coinData, error: coinListError } = useReadCoinList();

  if (coinListError) {
    throw new Error("CoinStats Error: " + coinListError.message);
  }

  // COMMENTED OUT: Old CFGI.io implementation (replaced with Alternative.me)
  // const activeCoinSlug = useMemo(() => {
  //   return coinData?.find((coin) => coin.symbol === widget.props?.token)?.slug;
  // }, [widget.props?.token, coinData]);
  //
  // const { data = [], error: CFGIError } = useFetchFearAndGreed(widget?.props?.token, activeCoinSlug);
  //
  // if (CFGIError) {
  //   throw new Error("CoinStats Error: " + CFGIError.message);
  // }

  // NEW: Using Alternative.me (Free, Bitcoin-focused Fear & Greed Index)
  const { data = [], error: CFGIError } = useFetchAlternativeMeFearAndGreed();

  if (CFGIError) {
    throw new Error("Alternative.me Error: " + CFGIError.message);
  }

  // const { data: testt } = useReadFearAndGridFromDb(widget?.props?.token);

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  return (
    <WidgetWrapper
      title="CFGI"
      widget={widget}
      handleLearnMore={() => {
        setShowInfo(true);
      }}
      className="gap-3"
    >
      {/* <div className="flex justify-center">
        <CoinStatsTokenDropdown
          options={tokenArray}
          setValue={(coin) => {
            updateWidgetPropsFromAtom({
              tabId: activeLayout.id,
              widgetId: widget.id,
              widgetProps: {
                ...widget.props,
                token: coin,
              },
            });
          }}
          value={widget?.props?.token}
          align="center"
        />
      </div> */}
      <div className="flex justify-center">
        <p className="text-xl font-semibold text-white text-center">
          Overall Crypto Market<br />Fear and Greed
        </p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-0">
        <div className="flex flex-col gap-4">
          <Progress
            progress={data[0]?.cfgi}
            // progress={data[data?.length - 1]?.cfgi}
            // progress={20 * 1}
            // progress={20 * 2}
            // progress={20 * 3}
            // progress={20 * 4}
            // progress={20 * 5}
          />
        </div>
        <p className="text-base leading-[1.35] text-[#878787]">
          <span className="text-[white]">{data[data?.length - 1]?.cfgi || 0}</span> Avg. yesterday
          {/* <span className="text-[white]">{data[0]?.cfgi || 0}</span> Avg. yesterday */}
        </p>
      </div>

      <AnimatePresence>
        {showInfo && (
          <div className="absolute top-[10px] right-[10px] bottom-[10px] left-[10px] z-9 flex items-end">
            <motion.div
              className="scrollbar max-h-full overflow-auto rounded-[22px] bg-[#111] px-5 py-4"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <h3 className="text-base leading-[1.35] font-semibold text-white">CFGI</h3>
                    <p className="text-[13px] leading-[1.25] font-light text-[#878787]">Learn about the CFGI</p>
                  </div>
                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    The Crypto Fear and Greed Index measures the emotions and sentiments driving the cryptocurrency
                    market. Ranging from 0 (Extreme Fear) to 100 (Extreme Greed), the index helps investors gauge
                    whether the market is undervalued or overheated, offering a quick snapshot of current market
                    psychology.
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <p className={"w-[50px] text-[13px] leading-[1.35] font-medium"} style={{ color: colors[0] }}>
                        0-19
                      </p>
                      <p className="text-[13px] leading-[1.35] font-medium text-[#696969]">Extreme Fear</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="w-[50px] text-[13px] leading-[1.35] font-medium" style={{ color: colors[1] }}>
                        20-39
                      </p>
                      <p className="text-[13px] leading-[1.35] font-medium text-[#696969]">Fear</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="w-[50px] text-[13px] leading-[1.35] font-medium" style={{ color: colors[2] }}>
                        40-59
                      </p>
                      <p className="text-[13px] leading-[1.35] font-medium text-[#696969]">Neutral</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="w-[50px] text-[13px] leading-[1.35] font-medium" style={{ color: colors[3] }}>
                        60-79
                      </p>
                      <p className="text-[13px] leading-[1.35] font-medium text-[#696969]">Greed</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="w-[50px] text-[13px] leading-[1.35] font-medium" style={{ color: colors[4] }}>
                        80-100
                      </p>
                      <p className="text-[13px] leading-[1.35] font-medium text-[#696969]">Extreme Greed</p>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold text-[#696969] text-[1.25]">
                      We use data from{" "}
                      <a href="https://alternative.me/crypto/fear-and-greed-index/" target="_blank">
                        Alternative.me
                      </a>
                    </p>
                  </div>
                </div>

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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </WidgetWrapper>
  );
}
