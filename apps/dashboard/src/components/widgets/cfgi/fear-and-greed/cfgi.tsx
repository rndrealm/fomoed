"use client";
import React, { useMemo, useState } from "react";
import { Close } from "@/components/icons/icons";
import { AnimatePresence, motion } from "motion/react";
import { modalSlide } from "@/lib/utils";
import { Progress } from "./progress";
import {
  useFetchFearAndGreed,
  useReadCoinList,
} from "@/services/queries/charts";
import CoinStatsTokenDropdown from "../../shared/coin-stats-token-dropdown";
import { tokenArray } from "./tokenArray";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { WidgetWrapper } from "../../shared";

const colors = [
  "#FF004D",
  "#FF540B",
  "#FFD600",
  "#90FF00",
  "#03EBF3",
  "#03EBF3",
];

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function CFGI(props: IProps) {
  const { widget } = props;
  const [showInfo, setShowInfo] = useState(false);

  const { data: coinData } = useReadCoinList();

  const activeCoinSlug = useMemo(() => {
    return coinData?.find((coin) => coin.symbol === widget.props?.token)?.slug;
  }, [widget.props?.token, coinData]);

  const { data = [] } = useFetchFearAndGreed(
    widget?.props?.token,
    activeCoinSlug
  );

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
      <div className="flex justify-center">
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
      </div>

      <div className="flex flex-col items-center justify-center flex-1 gap-0">
        <div className="flex flex-col gap-4">
          <Progress
            progress={data[data?.length - 1]?.cfgi}
            // progress={20 * 1}
            // progress={20 * 2}
            // progress={20 * 3}
            // progress={20 * 4}
            // progress={20 * 5}
          />
        </div>
        <p className="text-base leading-[1.35] text-[#878787]">
          <span className="text-[white]">{data[0]?.cfgi || 0}</span> Avg.
          yesterday
        </p>
      </div>

      <AnimatePresence>
        {showInfo && (
          <div className="absolute  bottom-[10px] left-[10px] right-[10px] top-[10px] z-9 flex items-end">
            <motion.div
              className="bg-[#111] rounded-[22px] py-4 px-5 overflow-auto max-h-full scrollbar"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-base leading-[1.35] text-white">
                      CFGI
                    </h3>
                    <p className="font-light text-[13px] leading-[1.25] text-[#878787]">
                      Learn about the CFGI
                    </p>
                  </div>
                  <p className="font-medium text-[13px] leading-[1.35] text-white">
                    The Crypto Fear and Greed Index measures the emotions and
                    sentiments driving the cryptocurrency market. Ranging from 0
                    (Extreme Fear) to 100 (Extreme Greed), the index helps
                    investors gauge whether the market is undervalued or
                    overheated, offering a quick snapshot of current market
                    psychology.
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <p
                        className={
                          "w-[50px] font-medium leading-[1.35] text-[13px]"
                        }
                        style={{ color: colors[0] }}
                      >
                        0-19
                      </p>
                      <p className="font-medium leading-[1.35] text-[#696969] text-[13px]">
                        Extreme Fear
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p
                        className="w-[50px] font-medium leading-[1.35] text-[13px]"
                        style={{ color: colors[1] }}
                      >
                        20-39
                      </p>
                      <p className="font-medium leading-[1.35] text-[#696969] text-[13px]">
                        Fear
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p
                        className="w-[50px] font-medium leading-[1.35] text-[13px]"
                        style={{ color: colors[2] }}
                      >
                        40-59
                      </p>
                      <p className="font-medium leading-[1.35] text-[#696969] text-[13px]">
                        Neutral
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p
                        className="w-[50px] font-medium leading-[1.35] text-[13px]"
                        style={{ color: colors[3] }}
                      >
                        60-79
                      </p>
                      <p className="font-medium leading-[1.35] text-[#696969] text-[13px]">
                        Greed
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p
                        className="w-[50px] font-medium leading-[1.35] text-[13px]"
                        style={{ color: colors[4] }}
                      >
                        80-100
                      </p>
                      <p className="font-medium leading-[1.35] text-[#696969] text-[13px]">
                        Extreme Greed
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[#696969] text-xs font-semibold text-[1.25]">
                      We use data from{" "}
                      <a href="https://cfgi.io/" target="_blank">
                        CFGI.io
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    className="rounded-[40px] bg-[#272727] flex items-center justify-center gap-1 h-[26px] app_widget_button"
                    onClick={() => {
                      setShowInfo(false);
                    }}
                  >
                    <p className="font-medium text-[13px] text-white whitespace-nowrap app_widget_button__text">
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
