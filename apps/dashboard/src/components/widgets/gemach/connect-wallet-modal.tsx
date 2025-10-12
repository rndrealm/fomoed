import React from "react";
import { GemachUserIcon, Learn } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useSetAtom } from "jotai";
import { toggleHowItWorksAtom } from "@/lib/atoms/gemach";

export function ConnectWalletModal() {
  const { openConnectModal } = useConnectModal();

  const toggleHowItWorks = useSetAtom(toggleHowItWorksAtom);

  return (
    <div className="w-full h-full bg-[rgb(26,26,26,0.5)] backdrop-blur-2xl border border-[#222222] rounded-[20px]">
      <div className="flex flex-col gap-6 mx-auto pt-6 px-6 pb-4 h-full w-full items-center justify-between">
        <div className="flex justify-center items-center w-full">
          <h3 className="text-white text-sm font-bold">Connect Wallet</h3>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center">
            <div className="w-[32px] h-[32px] flex items-center justify-between">
              <GemachUserIcon />
            </div>
          </div>
          <Button className="bg-[#2B2B2B]" onClick={openConnectModal}>
            Connect Wallet
          </Button>
        </div>

        <div className="flex justify-between items-center w-full gap-2">
          <div className="w-[26px] h-[26px] invisible"></div>

          <button
            type="button"
            onClick={() => {
              toggleHowItWorks(true);
            }}
          >
            <div className="flex items-center gap-2 rounded-[40px] border border-[#181818] px-[10px] py-[5px]">
              <div className="w-[16px] h-[16px]">
                <Learn />
              </div>
              <p className="text-[#A6AEB2] text-[10px] leading-[16px] font-medium">How it works</p>
            </div>
          </button>

          <div className="w-[26px] h-[26px] flex items-center justify-center">
            <Learn />
          </div>
        </div>
      </div>
    </div>
  );
}
