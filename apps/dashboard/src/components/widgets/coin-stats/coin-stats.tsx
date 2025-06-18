"use client";
import React, { useState } from "react";
import {
  ArrowUp,
  Close,
  CoinStats as CoinStatsIcon,
  Explorer,
  Globe,
  Info,
  Link,
  Question,
  Twitter,
} from "@/components/icons/icons";
import { OptionsDropdown } from "../shared/options-dropwdown";
import {
  useFetchCoinStatsSingleToken,
  useFetchCoinStatsToken,
  useReadCoinList,
} from "@/services/queries/charts";
import CoinStatsTokenDropdown from "../shared/coin-stats-token-dropdown";
import { AnimatePresence, motion } from "motion/react";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import CoinDropdown from "./coin-dropdown";
import { formatMarketCapNumber, modalSlide } from "@/lib/utils";

interface ILinkItem {
  icon: () => React.JSX.Element;
  label: string;
  href?: string;
}

function LinkItem(props: ILinkItem) {
  const { icon, label, href } = props;
  return (
    <a target="_blank" href={href}>
      <div className="py-1 px-[6px] rounded-lg bg-[#141414] flex items-center gap-1">
        {icon()}
        {/* <p className="text-sm font-normal text-white">{label}</p> */}
      </div>
    </a>
  );
}

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function CoinStats(props: IProps) {
  const { widget } = props;
  const { data = [] } = useFetchCoinStatsToken();
  const { data: coinStats } = useFetchCoinStatsSingleToken(
    widget?.props?.token
  );

  const [showInfo, setShowInfo] = useState(false);

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  return (
    <div className="flex flex-col gap-3 p-4 pt-0 rounded-2xl bg-[#000] relative overflow-hidden h-full justify-between">
      <div className="flex flex-col gap-1">
        <div className="cursor-grab flex justify-center pt-4 pb-1">
          <div className="w-[36px] h-[5px] bg-[#444] rounded-[2px]"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CoinStatsIcon />
            <h4 className="text-base text-[#878787] leading-[1.35] font-semibold">
              COIN STATS
            </h4>
          </div>

          <div className="flex items-center gap-2">
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

      <div className="flex justify-center">
        <CoinDropdown
          options={data}
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
        />
      </div>

      <div className="flex flex-col gap-6 pb-4">
        <div className="flex justify-center items-center gap-8">
          <div className="flex flex-col items-center">
            <h3 className="text-sm text-[#878787] leading-[1.35] font-medium">
              Rank
            </h3>
            <h3 className="text-xl text-white leading-[1.35] font-bold">
              {coinStats?.rank}
            </h3>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-sm text-[#878787] leading-[1.35] font-medium">
              Market Cap
            </h3>
            <div className="flex items-center">
              <h3 className="text-xl text-white leading-[1.35] font-bold">
                {formatMarketCapNumber(coinStats?.marketCap || "")}

                {/* $2.61T */}
              </h3>
              {/* <ArrowUp />
              <p className="text-xs text-[#84ebb4] leading-[1.35] font-semibold">
                2.98%
              </p> */}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex justify-center relative">
              <div className="flex justify-center gap-1 bg-[#000] px-1 relative z-2">
                <Link />
                <p className="text-sm text-[#878787] leading-[1.35] font-medium">
                  Links
                </p>
              </div>
              <div className="w-full h-[1px] bg-[#161616] absolute top-[50%] z-1"></div>
            </div>

            <div className="flex justify-center gap-1 pb-4 border-b border-[#161616]">
              {/* <LinkItem icon={Globe} label="Website" />
              <LinkItem icon={Twitter} label="X (Twitter)" />
              <LinkItem icon={Explorer} label="Explorer" /> */}

              <LinkItem icon={Globe} label="" href={coinStats?.websiteUrl} />
              <LinkItem icon={Twitter} label="" href={coinStats?.twitterUrl} />
              <LinkItem
                icon={Explorer}
                label=""
                href={coinStats?.explorers[0]}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-[#878787] leading-[1.35]">
                  {/* 24h Volume */}
                  Volume
                </p>
              </div>

              <p className="font-bold text-sm text-[#fff] leading-[1.35]">
                {/* $42.61b */}
                {formatMarketCapNumber(coinStats?.volume || "")}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-[#878787] leading-[1.35]">
                  FDV
                </p>
                <Info />
              </div>

              <p className="font-bold text-sm text-[#fff] leading-[1.35]">
                {formatMarketCapNumber(coinStats?.fullyDilutedValuation || "")}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-[#878787] leading-[1.35]">
                  Circulating Supply
                </p>
                <Info />
              </div>

              <p className="font-bold text-sm text-[#fff] leading-[1.35]">
                {formatMarketCapNumber(coinStats?.availableSupply || "", false)}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-[#878787] leading-[1.35]">
                  Total Supply
                </p>
                <Info />
              </div>

              <p className="font-bold text-sm text-[#fff] leading-[1.35]">
                {formatMarketCapNumber(coinStats?.totalSupply || "", false)}
              </p>
            </div>
          </div>
        </div>
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
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-base leading-[1.35] text-white">
                      MARKET CAP
                    </h3>
                    <p className="font-light text-[13px] leading-[1.25] text-[#878787]">
                      Learn about the Marketcap
                    </p>
                  </div>
                  <p className="font-medium text-[13px] leading-[1.35] text-white">
                    Market capitalization (market cap) is the total value of a
                    cryptocurrency. It’s calculated by multiplying the current
                    price by the total circulating supply. It gives an idea of a
                    coin&apos;s overall size and importance in the market.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-base leading-[1.35] text-white">
                      Volume
                    </h3>
                    <p className="font-light text-[13px] leading-[1.25] text-[#878787]">
                      Learn about the Volume
                    </p>
                  </div>
                  <p className="font-medium text-[13px] leading-[1.35] text-white">
                    Volume measures how much of a cryptocurrency has been traded
                    over a specific period, usually 24 hours. It shows how
                    active and liquid a market is — higher volume often means
                    more interest and easier buying or selling.
                  </p>
                </div>

                <p className="text-[#696969] text-xs font-semibold text-[1.25]">
                  We use data from{" "}
                  <a href="https://coinstats.app/" target="_blank">
                    coinstats.app
                  </a>
                </p>

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
    </div>
  );
}
