"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, Maximize2, PieChart } from "lucide-react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import dashboard from "@/lib/assets/dashboard";
import { OptionsDropdown } from "../../../shared/options-dropwdown";
import { SettingsAscendexIcon } from "@/components/icons/icons";
import ConnectButton from "../../../dex/connect-button";
import { ModalContainer } from "@/components/shared";
import DepositModal from "../modals/deposit-modal";

const AscendexLogo = () => (
  <Image src={dashboard.ascendexLogo} alt="AscendEX Logo" width={108} height={16} className="object-contain" priority />
);

interface AscendexHeaderProps {
  widget: LayoutType["widgets"][0];
  activeView: "futures" | "spot" | "lend" | "conditional" | "balance" | "settings";
  onViewChange: (view: "futures" | "spot" | "lend" | "conditional" | "balance" | "settings") => void;
}

const navLinks = [
  { label: "Futures", value: "futures" as const },
  { label: "Spot", value: "spot" as const },
  { label: "Lend", value: "lend" as const },
];

export default function AscendexHeader({ widget, activeView, onViewChange }: AscendexHeaderProps) {
  const [isOpenDeposit, setIsOpenDeposit] = useState(false);
  const toggleModalDeposit = () => {
    setIsOpenDeposit(!isOpenDeposit);
  };
  return (
    <>
      <div className="flex items-center justify-between w-full h-[62px] px-4 bg-[#121317] relative">
        <div className="absolute h-[50px] top-[-20px] bottom-0 left-0 right-0 cursor-grab" />

        {/* Logo + Nav */}
        <div className="flex items-center gap-6 relative z-10 pointer-events-auto">
          <div className="flex items-center gap-8">
            <AscendexLogo />
            <nav className="hidden sm:flex items-center text-sm text-[#9CA3AF]">
              {navLinks.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => onViewChange(value)}
                  className={`px-[12px] py-[4px] rounded-[6px] transition-colors ${
                    activeView === value ? "text-white" : "hover:text-white hover:bg-[#1C1D21]"
                  }`}
                >
                  {label}
                </button>
              ))}

              <button
                onClick={() => onViewChange("conditional")}
                className={`px-[12px] py-[4px] rounded-[6px] transition-colors flex items-center gap-[4px] ${
                  activeView === "conditional" ? "text-white" : "hover:text-white hover:bg-[#1C1D21]"
                }`}
              >
                Conditional
                <ChevronDown size={12} strokeWidth={2} />
              </button>
            </nav>
          </div>
        </div>

        {/* Grab handle */}
        <div className="absolute left-1/2 -translate-x-1/2 flex cursor-grab justify-center z-20">
          <div className="h-[5px] w-[36px] rounded-[2px] bg-[#444]" />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 relative z-10 pointer-events-auto">
          <ConnectButton buttonClassName="bg-[#51D2C1] w-full cursor-pointer py-0 px-3.5 rounded-md text-[#010101] font-medium text-xxs h-8" />
          {activeView !== "balance" && (
            <button
              onClick={toggleModalDeposit}
              className="flex items-center justify-center bg-[rgba(118,55,186,0.2)] text-[#7637BA] 
    font-inter font-semibold text-[12px] leading-[14px] 
    px-[12px] py-[9px] rounded-[8px] hover:bg-[rgba(118,55,186,0.3)] 
    transition-colors"
            >
              Deposit
            </button>
          )}

          <button
            onClick={() => onViewChange("settings")}
            className={`transition-colors ${
              activeView === "settings" ? "text-white" : "text-[#A6AEB2] hover:text-white"
            }`}
          >
            <SettingsAscendexIcon />
          </button>

          <button
            onClick={() => onViewChange("balance")}
            className={`flex items-center gap-2 px-3 py-2 rounded-[8px] transition-colors ${
              activeView === "balance" ? "text-white" : "text-[#A6AEB2] hover:text-white hover"
            }`}
          >
            <PieChart className="h-[16px] w-[16px]" />
          </button>

          <div className="flex items-center justify-center">
            <OptionsDropdown widget={widget} />
          </div>

          <div className="flex items-center justify-center w-6 h-6 rounded-[4px] border border-[#2A2B2E] bg-[#1C1D21]">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Maximize2 className="h-[16px] w-[16px] text-[#A6AEB2]" />
            </button>
          </div>
        </div>
      </div>
      <ModalContainer
        open={isOpenDeposit}
        handleClose={toggleModalDeposit}
        headerClassName="text-center w-full text-lg font-medium"
        hideX
        className="!max-w-[462px] px-6 py-8 bg-[#141416] gap-0"
      >
        <DepositModal toggleModal={toggleModalDeposit} />
      </ModalContainer>
    </>
  );
}
