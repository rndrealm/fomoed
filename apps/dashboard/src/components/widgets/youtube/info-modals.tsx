import React from "react";
import { motion } from "motion/react";
import { Close } from "@/components/icons/icons";
import { modalSlide } from "@/lib/utils";

interface InfoModalProps {
  onClose: () => void;
}

export function InfoModal({ onClose }: InfoModalProps) {
  return (
    <div className="absolute top-[10px] right-[10px] bottom-[10px] left-[10px] z-9 flex items-end">
      <motion.div
        className="scrollbar max-h-full overflow-auto rounded-[22px] bg-[#111] px-5 py-4 text-white"
        variants={modalSlide}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-base leading-[1.35] font-semibold">YouTube Widget for Traders</h3>
            <p className="text-[13px] leading-[1.25] font-light text-[#878787]">
              Watch trading content while monitoring your charts and indicators.
            </p>
          </div>

          <div className="flex flex-col gap-4 text-[13px]">
            <div>
              <h4 className="font-semibold text-white mb-1">Multi-Tasking for Traders</h4>
              <p className="font-medium text-white/80">
                This widget allows you to watch YouTube videos or live streams directly in your trading dashboard. Keep an eye on your charts, price indicators, and market data while watching trading analysis, market news, or other content—all without switching tabs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-1">Live Stream Support</h4>
              <p className="font-medium text-white/80">
                Watch live trading streams, market analysis sessions, and breaking financial news in real-time. The widget fully supports both pre-recorded videos and live broadcasts, so you can follow your favorite traders as they analyze markets live.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-1">Stay Informed</h4>
              <p className="font-medium text-white/80">
                Follow market commentary from top analysts, watch technical analysis tutorials, or catch up on crypto market news—all while keeping your trading indicators visible. Perfect for staying informed during trading hours.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-1">Seamless Integration</h4>
              <p className="font-medium text-white/80">
                Search for any trading-related content or paste YouTube URLs directly. The widget integrates perfectly with your other trading widgets, creating a unified workspace for analysis and education.
              </p>
            </div>
          </div>

          <p className="text-xs font-semibold text-[#696969] text-[1.25] pt-2">
            Powered by{" "}
            <a href="https://www.youtube.com/" target="_blank" className="underline">
              YouTube
            </a>
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              className="app_widget_button flex h-[26px] items-center justify-center gap-1 rounded-[40px] bg-[#272727]"
              onClick={onClose}
            >
              <p className="app_widget_button__text text-[13px] font-medium whitespace-nowrap text-white">Close</p>
              <div className="app_widget_button__icon">
                <Close fill="#878787" />
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}