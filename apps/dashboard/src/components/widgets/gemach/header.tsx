import React from "react";
import { Binoculars } from "@/components/icons/icons";
import { ConnectWalletBtn } from "./connect-wallet-btn";
import { copyTradeTraderWalletAtom, toggleCreateCopyTradeAtom } from "@/lib/atoms/gemach";
import { useSetAtom } from "jotai";

export function Header() {
  const toggleCreateCopyTrade = useSetAtom(toggleCreateCopyTradeAtom);
  const setCopyTraderWallet = useSetAtom(copyTradeTraderWalletAtom);

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <div className="w-[20px] h-[20px] rounded-full bg-[#383838] flex items-center justify-center">
          <Binoculars />
        </div>
        <h3 className="text-sm font-medium text-white leading-[1.25]">Overview</h3>
      </div>

      <div className="flex gap-2 items-center">
        <button
          type="button"
          className="px-2 py-[6px] rounded-lg bg-[#406AC5]"
          onClick={() => {
            setCopyTraderWallet("");
            toggleCreateCopyTrade(true);
          }}
        >
          <p className="text-xs font-medium text-[#FAFAFA] leading-[16px] tracking-[-0.4%]">Create Copy Trade</p>
        </button>

        {/* <button type="button" className="px-2 py-[6px] rounded-lg bg-[#406AC5] flex items-center gap-1">
          <ConnectWallet />
          <p className="text-xs font-medium text-[#FAFAFA] leading-[16px] tracking-[-0.4%]">Connect Wallet</p>
        </button> */}

        <ConnectWalletBtn />
      </div>
    </div>
  );
}
