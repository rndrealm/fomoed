import React, { useState } from "react";
import { WidgetWrapper } from "../shared";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { Header } from "./header";
import { AccountInfo } from "./account-info";
import Content from "./content";
import { Modals } from "./modals";
import { AnimatePresence, motion } from "motion/react";
import { Close } from "@/components/icons/icons";
import { cn, modalSlide } from "@/lib/utils";

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function GemachCopyTrading(props: IProps) {
  const { widget } = props;
  const [showInfo, setShowInfo] = useState(false);

  return (
    <WidgetWrapper
      title="Hyperliquid Copy Trading by Gemach"
      widget={widget}
      isGemachCopyTrading
      titleIcon="none"
      headerClassName="gap-0"
      className="!pb-0"
      handleLearnMore={() => setShowInfo(true)}
    >
      <div className="flex-1 flex-col pt-2 overflow-hidden h-full w-full flex">
        <div className="flex flex-col gap-3">
          <Header />
          <AccountInfo />
        </div>

        <div className="text-white flex-1 flex flex-col gap-3 pt-4 overflow-hidden relative">
          <Content />
        </div>
      </div>

      <Modals />

      {/* Learn More Modal */}
      <AnimatePresence>
        {showInfo && (
          <div className="absolute top-[10px] right-[10px] bottom-[10px] left-[10px] z-[19] flex items-end">
            <motion.div
              className="scrollbar max-h-full overflow-auto rounded-[22px] bg-[#111] px-5 py-4 flex-1"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4 justify-between flex-1 h-full">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <h3 className="text-base leading-[1.35] font-semibold text-white">
                      Hyperliquid Copy Trading by Gemach
                    </h3>
                    <p className="text-[13px] leading-[1.25] font-light text-neutral-400">
                      Learn about Gemach Copy Trading
                    </p>
                  </div>

                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    Gemach Copy Trading allows you to automatically replicate the trades of experienced traders on
                    Hyperliquid, a decentralized perpetual futures exchange. This feature enables you to benefit from
                    the strategies and expertise of top performers without manually executing each trade yourself.
                  </p>

                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    By connecting your wallet, you can allocate a portion of your capital to follow
                    selected traders. The system automatically mirrors their positions proportionally to your
                    allocation, maintaining the same risk-to-reward ratios while respecting your account size and risk
                    parameters.
                  </p>

                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    You maintain full control over your funds and can stop copying at any time. Monitor your copied
                    positions in real-time, track performance metrics, and adjust your allocation based on trader
                    performance. This provides an opportunity to learn from successful strategies while potentially
                    generating returns.
                  </p>

                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    <strong>Key Features:</strong> Real-time trade replication, customizable position sizing,
                    performance tracking, risk management controls, and the ability to copy multiple traders
                    simultaneously.
                  </p>

                  <p className="text-xs font-semibold text-neutral-400 leading-[1.25]">
                    Powered by{" "}
                    <a href="https://gemach.io/" target="_blank" rel="noopener noreferrer" className="underline">
                      Gemach.io
                    </a>{" "}
                    on{" "}
                    <a href="https://hyperliquid.xyz/" target="_blank" rel="noopener noreferrer" className="underline">
                      Hyperliquid
                    </a>
                  </p>

                  <div className="bg-[#1a1a1a] border border-[#272727] rounded-lg p-3">
                    <p className="text-xs font-medium text-yellow-400 mb-1">⚠️ Risk Warning</p>
                    <p className="text-xs text-neutral-400 leading-[1.4]">
                      Copy trading involves significant risk. Past performance does not guarantee future results. You
                      may lose some or all of your invested capital. Only invest what you can afford to lose and ensure
                      you understand the risks involved.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      className="app_widget_button flex h-[26px] items-center justify-center gap-1 rounded-[40px] bg-[#272727]"
                      onClick={() => setShowInfo(false)}
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </WidgetWrapper>
  );
}
