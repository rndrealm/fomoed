"use client";
import React, { useState } from "react";
import { Close, Explorer, Globe, Info, Link, Twitter } from "@/components/icons/icons";
import { useFetchCoinStatsSingleToken, useFetchCoinStatsToken } from "@/services/queries/charts";
import { AnimatePresence, motion } from "motion/react";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import CoinDropdown from "./coin-dropdown";
import { formatMarketCapNumber, modalSlide } from "@/lib/utils";
import { WidgetWrapper } from "../shared";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ILinkItem {
  icon: React.JSX.Element;
  label: string;
  href?: string;
}

function LinkItem(props: ILinkItem) {
  const { icon, label, href } = props;
  return (
    <a target="_blank" href={href}>
      <div className="flex items-center gap-1 rounded-lg bg-[#141414] px-[6px] py-1">
        {icon}
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
  const { data: coinStats, error } = useFetchCoinStatsSingleToken(widget?.props?.token);

  if (error) {
    throw new Error("CoinStats Error: " + error.message);
  }

  const [showInfo, setShowInfo] = useState(false);

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  return (
    <WidgetWrapper
      title="COIN STATS"
      widget={widget}
      handleLearnMore={() => {
        setShowInfo(true);
      }}
      className="justify-between gap-3"
    >
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
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center">
            <h3 className="text-sm leading-[1.35] font-medium text-[#878787] select-none">Rank</h3>
            <h3 className="text-xl leading-[1.35] font-bold text-white">{coinStats?.rank}</h3>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-sm leading-[1.35] font-medium text-[#878787] select-none">Market Cap</h3>
            <div className="flex items-center">
              <h3 className="text-xl leading-[1.35] font-bold text-white select-none">
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
            <div className="relative flex justify-center">
              <div className="relative z-2 flex justify-center gap-1 bg-[#000] px-1 select-none">
                <Link />
                <p className="text-sm leading-[1.35] font-medium text-[#878787]">Links</p>
              </div>
              <div className="absolute top-[50%] z-1 h-[1px] w-full bg-[#161616]"></div>
            </div>

            <div className="flex justify-center gap-1 border-b border-[#161616] pb-4">
              {/* <LinkItem icon={Globe} label="Website" />
              <LinkItem icon={Twitter} label="X (Twitter)" />
              <LinkItem icon={Explorer} label="Explorer" /> */}

              <LinkItem
                icon={<Globe />}
                label=""
                href={widget.props.token === "bitcoin" ? "https://bitcoin.org/" : coinStats?.websiteUrl}
              />
              <LinkItem icon={<Twitter />} label="" href={coinStats?.twitterUrl} />
              <LinkItem icon={<Explorer />} label="" href={coinStats?.explorers?.[0]} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm leading-[1.35] font-medium text-[#878787] select-none">
                  {/* 24h Volume */}
                  Volume
                </p>
              </div>

              <p className="text-sm leading-[1.35] font-bold text-[#fff]">
                {/* $42.61b */}
                {formatMarketCapNumber(coinStats?.volume || "")}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm leading-[1.35] font-medium text-[#878787] select-none">FDV</p>

                <Tooltip>
                  <TooltipTrigger>
                    <Info />
                  </TooltipTrigger>
                  <TooltipContent className="mb-[2px] rounded-lg bg-[#1C1C1C] px-[6px] py-[3px]" showArrow={false}>
                    <p className="text-[13px] leading-[1.35] font-semibold text-[#878787]">Fully Diluted Value</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <p className="text-sm leading-[1.35] font-bold text-[#fff]">
                {formatMarketCapNumber(coinStats?.fullyDilutedValuation || "")}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm leading-[1.35] font-medium text-[#878787] select-none">Circulating Supply</p>
                {/* <Info /> */}
              </div>

              <p className="text-sm leading-[1.35] font-bold text-[#fff]">
                {formatMarketCapNumber(coinStats?.availableSupply || "", false)}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm leading-[1.35] font-medium text-[#878787] select-none">Total Supply</p>
                {/* <Info /> */}
              </div>

              <p className="text-sm leading-[1.35] font-bold text-[#fff]">
                {formatMarketCapNumber(coinStats?.totalSupply || "", false)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showInfo && (
          <div className="absolute top-[10px] right-[10px] bottom-[10px] left-[10px] z-9 flex items-end">
            <motion.div
              className="scrollbar max-h-full overflow-auto rounded-[22px] bg-[#111] px-5 py-4 text-white"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4">
                {/* --- NEW CONTENT START --- */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-base leading-[1.35] font-semibold">Understanding Coin Stats</h3>
                  <p className="text-[13px] leading-[1.25] font-light text-[#878787]">
                    Key metrics for analyzing a cryptocurrency.
                  </p>
                </div>

                <div className="flex flex-col gap-4 text-[13px]">
                  <div>
                    <h4 className="font-semibold text-white mb-1">Rank</h4>
                    <p className="font-medium text-white/80">
                      The cryptocurrency&apos;s rank is based on market cap. Rank #1 has the highest market cap.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-1">Market Cap</h4>
                    <p className="font-medium text-white/80">
                      The total current market value of a coin&apos;s circulating supply.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-1">Fully Diluted Value (FDV)</h4>
                    <p className="font-medium text-white/80">
                      The theoretical market cap if the total supply of a coin were in circulation.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-1">Volume (24h)</h4>
                    <p className="font-medium text-white/80">
                      The total value of a cryptocurrency traded in the last 24 hours.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-1">Circulating vs. Total Supply</h4>
                    <p className="font-medium text-white/80">
                      <strong>Circulating Supply</strong> is the number of coins available in the market.
                      <strong> Total Supply</strong> is the total number of coins that exist now, including locked ones.
                    </p>
                  </div>
                </div>
                {/* --- NEW CONTENT END --- */}

                <p className="text-xs font-semibold text-[#696969] text-[1.25] pt-2">
                  We use data from{" "}
                  <a href="https://coinstats.app/" target="_blank" className="underline">
                    coinstats.app
                  </a>
                </p>

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
