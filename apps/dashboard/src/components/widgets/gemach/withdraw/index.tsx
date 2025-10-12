import React, { useState } from "react";
import { Close } from "@/components/icons/icons";
import { Gdex } from "./gdex";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Hyperliquid } from "./hyperliquid";
import { RenderIf } from "@/components/shared";

interface IProps {
  handleClose: () => void;
}

export function Withdraw(props: IProps) {
  const { handleClose } = props;
  const [tab, setTab] = useState<"gdex" | "hyperliquid">("gdex");

  return (
    <div className="w-full h-full bg-[rgb(26,26,26,0.5)] backdrop-blur-2xl border border-[#222222] rounded-[20px]">
      <div className="flex flex-col gap-6 pt-6 px-4 pb-4 h-full w-full items-center justify-between">
        <div className="flex justify-between items-center w-full">
          <div className="w-[20px] h-[20px] bg-[red] invisible"></div>
          <h3 className="text-white text-sm font-bold">Withdraw</h3>
          <button type="button" className="w-[20px] h-[20px] flex justify-center items-center" onClick={handleClose}>
            <Close />
          </button>
        </div>
        <div className="flex justify-center gap-1">
          <button type="button" className="px-2 py-[6px] relative rounded-lg" onClick={() => setTab("gdex")}>
            <p
              className={cn(
                "text-[#A6AEB2] text-xs leading-[16px] tracking-[-0.4%] relative z-[1]",
                tab === "gdex" && "text-[#FAFAFA]",
              )}
            >
              Withdraw From GDEX
            </p>
            {tab === "gdex" && (
              <motion.div
                layoutId="app_gemach_fund_wallet_tab"
                className="absolute top-0 left-0 w-full h-full bg-[#406AC5] rounded-lg"
              />
            )}
          </button>

          <button type="button" className="px-2 py-[6px] relative rounded-lg" onClick={() => setTab("hyperliquid")}>
            <p
              className={cn(
                "text-[#A6AEB2] text-xs leading-[16px] tracking-[-0.4%] relative z-[1]",
                tab === "hyperliquid" && "text-[#FAFAFA]",
              )}
            >
              Withdraw From Hyperliquid
            </p>
            {tab === "hyperliquid" && (
              <motion.div
                layoutId="app_gemach_fund_wallet_tab"
                className="absolute top-0 left-0 w-full h-full bg-[#406AC5] rounded-lg"
              />
            )}
          </button>
        </div>

        <RenderIf condition={tab === "gdex"}>
          <Gdex handleClose={handleClose} />
        </RenderIf>

        <RenderIf condition={tab === "hyperliquid"}>
          <Hyperliquid handleClose={handleClose} />
        </RenderIf>
      </div>
    </div>
  );
}
