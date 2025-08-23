"use client";
import React, { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { WidgetWrapper } from "../shared";
import { useFetchWhaleTransactions, useReadCoinList } from "@/services/queries/charts"; 
import { cn, modalSlide } from "@/lib/utils";
import { Close, FullScreen } from "@/components/icons/icons";
import { Skeleton } from "@/components/ui/skeleton";
import WhaleTransactionTable from "./whale-transaction-table";
import { FullscreenControls } from "./fullscreen-controls";

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function WhaleTransactionWidget(props: IProps) {
  const { widget } = props;
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);

  const { data: transactions = [], isPending, error } = useFetchWhaleTransactions();
  const { data: coinData } = useReadCoinList();

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    if (!isFullscreen) {
      setIsControlsVisible(false);
    }
  };

  const onAnimationComplete = useCallback(() => {
    if (!isFullscreen) {
      setIsControlsVisible(true);
    }
  }, [isFullscreen]);

  return (
    <WidgetWrapper
      title="WHALE TRANSACTION TRACKER"
      widget={widget}
      handleLearnMore={() => setShowInfo(true)}
      titleIcon="none"
    >
      <div className={cn("flex h-full w-full flex-1 flex-col overflow-hidden", isFullscreen && "py-[60px]")}>
        {isPending ? (
          <Skeleton className="h-full w-full bg-neutral-800" />
        ) : error ? (
          <div className="flex h-full w-full items-center justify-center text-red-500">
            Error: {error.message}
          </div>
        ) : (
          <WhaleTransactionTable
            isFullscreen={isFullscreen}
            onAnimationComplete={onAnimationComplete}
            transactions={transactions}
            coinData={coinData || []} // Pass the coin data to the table
          />
        )}
      </div>

      <FullscreenControls
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />

      <div
        className={cn(
          "absolute right-[9px] bottom-[16px] z-[9] h-[28px] w-[28px] rounded-md border border-[#1c1c1c]",
           { "opacity-0": !isControlsVisible, "opacity-100": isControlsVisible }
        )}
        style={{
          background: "linear-gradient(180deg, #1b1b1b 0%, rgba(0, 0, 0, 0.38) 72.15%)",
          backdropFilter: "blur(7px)",
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <button
          className="flex h-full w-full items-center justify-center"
          onClick={toggleFullscreen}
        >
          <FullScreen />
        </button>
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
                <div className="flex flex-col">
                  <h3 className="text-base leading-[1.35] font-semibold text-white">Whale Transaction Tracker</h3>
                  <p className="text-[13px] leading-[1.25] font-light text-[#878787]">Learn about the Whale Transaction Tracker</p>
                </div>
                <p className="text-[13px] leading-[1.35] font-medium text-white">
                  The Whale Transaction Tracker monitors large transactions for top assets in real-time. It provides insights into significant market movements by showing the token, time, direction (Long/Short), and value of each major transaction, helping you spot potential trading opportunities.
                </p>
                <p className="text-xs font-semibold text-[#696969] text-[1.25]">
                  We use data from{" "}
                  <a href="https://www.coinglass.com/" target="_blank" className="underline">
                    Coinglass.com
                  </a>
                </p>
                <div className="flex justify-center">
                  <button
                    type="button"
                    className="app_widget_button flex h-[26px] items-center justify-center gap-1 rounded-[40px] bg-[#272727]"
                    onClick={() => setShowInfo(false)}
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
        )}
      </AnimatePresence>
    </WidgetWrapper>
  );
}
