"use client";
import React from "react";
import Image from "next/image";
import { ChevronDown, Maximize2 } from "lucide-react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import dashboard from "@/lib/assets/dashboard";
import { OptionsDropdown } from "../../shared/options-dropwdown";
import { SettingsAscendexIcon } from "@/components/icons/icons";

const AscendexLogo = () => (
  <Image src={dashboard.ascendexLogo} alt="AscendEX Logo" width={108} height={16} className="object-contain" priority />
);

interface AscendexHeaderProps {
  widget: LayoutType["widgets"][0];
}

const links = ["Futures", "Spot", "Lend"];

export default function AscendexHeader({ widget }: AscendexHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full h-[62px] px-4 bg-[#121317] relative">
      <div className="absolute h-[50px] top-[-20px] bottom-0 left-0 right-0 cursor-grab" />
      
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-6 relative z-10 pointer-events-auto">
        <div className="flex items-center gap-8">
          <AscendexLogo />
          <nav className="hidden sm:flex items-center text-sm text-[#9CA3AF]">
            {links.map((label) => (
              <a key={label} href="#" className="px-[12px] py-[4px] rounded-[6px] hover:text-white transition-colors">
                {label}
              </a>
            ))}

            <a
              href="#"
              className="px-[12px] py-[4px] rounded-[6px] hover:text-white transition-colors flex items-center gap-[4px]"
            >
              Conditional
              <ChevronDown size={12} strokeWidth={2} />
            </a>
          </nav>
        </div>
      </div>

      {/* Center: Grab handle */}
      <div className="absolute left-1/2 -translate-x-1/2 flex cursor-grab justify-center z-20">
        <div className="h-[5px] w-[36px] rounded-[2px] bg-[#444]" />
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3 relative z-10 pointer-events-auto">
        {/* Deposit button */}
        <button
          className="flex items-center justify-center bg-[rgba(118,55,186,0.2)] text-[#7637BA] 
          font-inter font-semibold text-[12px] leading-[14px] 
          px-[12px] py-[9px] rounded-[8px] hover:bg-[rgba(118,55,186,0.3)] 
          transition-colors"
        >
          Deposit
        </button>

        {/* Settings icon */}
        <button className="text-[#A6AEB2] hover:text-white transition-colors">
          <SettingsAscendexIcon />
        </button>

        {/* 3 dots */}
        <div className="flex items-center justify-center">
          <OptionsDropdown widget={widget} />
        </div>

        {/* Fullscreen icon */}
        <div className="flex items-center justify-center w-6 h-6 rounded-[4px] border border-[#2A2B2E] bg-[#1C1D21]">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Maximize2 className="h-[16px] w-[16px] text-[#A6AEB2]" />
          </button>
        </div>
      </div>
    </div>
  );
}