import React, { useState } from "react";
import { Close, CoinStats, Question } from "@/components/icons/icons";
import { OptionsDropdown } from "../../shared/options-dropwdown";
import { AnimatePresence, motion } from "motion/react";
import { modalSlide } from "@/lib/utils";
import { Progress } from "./progress";
import { useFetchFearAndGreed } from "@/services/queries/charts";

export default function CFGI() {
  const [showInfo, setShowInfo] = useState(false);

  const { data = [] } = useFetchFearAndGreed();

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#000] relative overflow-hidden h-[440px] justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex justify-center">
          <div className="cursor-grab w-[36px] h-[5px] bg-[#444] rounded-[2px]"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CoinStats />
            <h4 className="text-base text-[#878787] leading-[1.35] font-semibold">
              CFGI
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
            {/* <OptionsDropdown widget={widget} /> */}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <Progress
          progress={data[0]?.cfgi}
          // progress={20 * 1}
          // progress={20 * 2}
          // progress={20 * 3}
          // progress={20 * 4}
          // progress={20 * 5}
        />
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            className="absolute bottom-[10px] left-[10px] right-[10px] bg-[#111] rounded-[22px] py-4 px-5 z-9"
            variants={modalSlide}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
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
        )}
      </AnimatePresence>
    </div>
  );
}
