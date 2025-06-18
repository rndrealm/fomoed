"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  Close,
  Dominance as DominanceIcon,
  Favourite,
  Question,
} from "@/components/icons/icons";
import { OptionsDropdown } from "../shared/options-dropwdown";
import { cn, formatPriceSignificant, modalSlide } from "@/lib/utils";
import { RenderIf } from "@/components/shared";
import { useFetchMarkeData } from "@/services/queries/charts";
import { LayoutType } from "@/lib/atoms/layoutAtom";

const colorMap = {
  BTC: "#ffdb43",
  ETH: "#84ebb4",
  Others: "#878787",
};

interface IDominanceItem {
  variant: "BTC" | "ETH" | "Others";
  value: number | string;
  change: number;
  alternate?: boolean;
  duration?: number;
  delay?: number;
}

const transition = (duration: number, delay: number) => ({
  duration,
  delay,
  ease: [0.5, 0, 0, 1],
});

function DominanceItem(props: IDominanceItem) {
  const {
    variant,
    value,
    change,
    alternate = false,
    delay = 0,
    duration = 0.5,
  } = props;

  const hasMounted = useRef(false);
  const effectiveDelay = hasMounted.current ? 0 : delay;

  const isNegative = Math.sign(change) === -1;
  const color = colorMap[variant];

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  return (
    <motion.div
      className="flex flex-col gap-[10px]"
      animate={{ width: `${value}%` }}
      transition={transition(duration, 0)}
    >
      <div className="overflow-hidden" style={{ height: "content-fit" }}>
        <motion.div
          className={cn(
            "flex flex-col overflow-hidden",
            alternate ? "visible" : "invisible"
          )}
          initial={{ y: 55 }}
          animate={{ y: 0 }}
          transition={transition(duration, effectiveDelay)}
        >
          <p
            className={cn(
              "text-xs font-medium leading-[1.35]",
              `text-[${color}]`
            )}
          >
            {variant}
          </p>
          <p className="text-white text-xs font-bold leading-[1.35]">
            {value}%
          </p>
          {/* <div className="flex items-center gap-1">
            <ArrowUp small negative={isNegative} />
            <p
              className={cn(
                "text-[10px] font-semibold leading-[1.35]",
                isNegative ? "text-[#FF8970]" : "text-[#84ebb4]"
              )}
            >
              2.98%
            </p>
          </div> */}
        </motion.div>
      </div>
      <motion.div
        className="h-[8px] w-full rounded-sm"
        initial={{ background: color, width: "0" }}
        animate={{ width: "100%" }}
        transition={transition(duration, effectiveDelay)}
      ></motion.div>

      <div className="overflow-hidden" style={{ height: "content-fit" }}>
        <motion.div
          className={cn(
            "flex flex-col overflow-hidden",
            !alternate ? "visible" : "invisible"
          )}
          initial={{ y: 55 }}
          animate={{ y: 0 }}
          transition={transition(duration, effectiveDelay + 0.2)}
        >
          <p
            className={cn("text-xs font-medium leading-[1.35]")}
            style={{ color }}
          >
            {variant}
          </p>
          <p className="text-white text-xs font-bold leading-[1.35]">
            {value}%
          </p>
          {/* <div className="flex items-center gap-1">
            <ArrowUp small negative={isNegative} />
            <p
              className={cn(
                "text-[10px] font-semibold leading-[1.35]",
                isNegative ? "text-[#FF8970]" : "text-[#84ebb4]"
              )}
            >
              2.98%
            </p>
          </div> */}
        </motion.div>
      </div>
    </motion.div>
  );
}

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function Dominance(props: IProps) {
  const { widget } = props;
  const { data, isSuccess } = useFetchMarkeData();

  const [showInfo, setShowInfo] = useState(false);

  const btcDominance = formatPriceSignificant(
    data?.market_cap_percentage?.btc || 0
  );

  const ethDominance = formatPriceSignificant(
    data?.market_cap_percentage?.eth || 0
  );
  const othersDominance = formatPriceSignificant(
    100 - (Number(btcDominance) + Number(ethDominance))
  );

  return (
    <div className="flex flex-col gap-4 p-4 pt-0 rounded-2xl bg-[#000] relative overflow-hidden h-full">
      <div className="flex flex-col gap-[2px]">
        <div className="cursor-grab flex justify-center pt-4 pb-1">
          <div className="w-[36px] h-[5px] bg-[#444] rounded-[2px]"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DominanceIcon />
            <h4 className="text-base text-[#878787] leading-[1.35] font-semibold">
              DOMINANCE
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {/* <button type="button" onClick={() => { }}>
              <Favourite />
            </button> */}
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

      <div className="flex flex-col">
        <div className="flex flex-col">
          <h4 className="font-medium text-sm text-[#878787] leading-[1.35]">
            Bitcoin Dominance
          </h4>
          <div className="flex items-center gap-1">
            <p className="text-white text-xl font-bold">{btcDominance}%</p>
            {/* <div className="flex items-center">
              <ArrowUp />
              <p className="font-semibold text-xs leading-[1.35] text-[#84ebb4]">
                2.98%
              </p>
            </div> */}
          </div>
        </div>

        <div className="flex items-center gap-[6px]">
          <RenderIf condition={isSuccess}>
            <DominanceItem variant="BTC" value={btcDominance} change={2.98} />
            <DominanceItem
              variant="ETH"
              value={ethDominance}
              change={-0.2}
              alternate
              delay={0.5}
            />
            <DominanceItem
              variant="Others"
              value={othersDominance}
              change={-0.2}
              delay={1}
            />
          </RenderIf>
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
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-base leading-[1.35] text-white">
                      BTC Dominance
                    </h3>
                    <p className="font-light text-[13px] leading-[1.25] text-[#878787]">
                      Learn about the BTC Dominance
                    </p>
                  </div>
                  <p className="font-medium text-[13px] leading-[1.35] text-white">
                    Bitcoin (BTC) dominance is the percentage of the total
                    cryptocurrency market&apos;s value that Bitcoin accounts
                    for.
                  </p>

                  <div className="flex flex-col">
                    <p className="text-[#696969] text-xs font-semibold text-[1.25]">
                      We use data from{" "}
                      <a href="https://www.coingecko.com/" target="_blank">
                        Coingecko.com
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
    </div>
  );
}
