"use client";
import React from "react";
import Image from "next/image";
import { ChevronDown, Maximize2 } from "lucide-react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import dashboard from "@/lib/assets/dashboard";
import { OptionsDropdown } from "../../shared/options-dropwdown";

const AscendexLogo = () => (
  <Image
    src={dashboard.ascendexLogo}
    alt="AscendEX Logo"
    width={108}
    height={16}
    className="object-contain"
    priority
  />
);

interface AscendexHeaderProps {
  widget: LayoutType["widgets"][0];
}

export default function AscendexHeader({ widget }: AscendexHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full h-[62px] px-4 bg-[#121317]">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-8">
          <AscendexLogo />
          <nav className="hidden sm:flex items-center text-sm text-[#9CA3AF]">
            {["Futures", "Spot", "Lend"].map((label) => (
              <a
                key={label}
                href="#"
                className="px-[12px] py-[4px] rounded-[6px] hover:text-white transition-colors"
              >
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
      <div className="absolute left-1/2 -translate-x-1/2 flex cursor-grab justify-center">
        <div className="h-[5px] w-[36px] rounded-[2px] bg-[#444]" />
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3">
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
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 
                2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 
                1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 
                1.51V21a2 2 0 0 1-2 2 2 2 0 0 
                1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 
                1.65 1.65 0 0 0-1.82.33l-.06.06a2 
                2 0 0 1-2.83 0 2 2 0 0 
                1 0-2.83l.06-.06a1.65 1.65 
                0 0 0 .33-1.82 1.65 1.65 
                0 0 0-1.51-1H3a2 2 0 0 
                1-2-2 2 2 0 0 1 2-2h.09a1.65 
                1.65 0 0 0 1.51-1 1.65 1.65 
                0 0 0-.33-1.82l-.06-.06a2 
                2 0 0 1 0-2.83 2 2 0 0 
                1 2.83 0l.06.06a1.65 1.65 
                0 0 0 1.82.33H9a1.65 1.65 
                0 0 0 1-1.51V3a2 2 0 0 
                1 2-2 2 2 0 0 1 2 2v.09a1.65 
                1.65 0 0 0 1 1.51 1.65 1.65 
                0 0 0 1.82-.33l.06-.06a2 
                2 0 0 1 2.83 0 2 2 0 0 
                1 0 2.83l-.06.06a1.65 1.65 
                0 0 0-.33 1.82V9c0 .66.26 
                1.3.73 1.77.47.47 1.11.73 
                1.77.73h.09a2 2 0 0 1 
                2 2 2 2 0 0 1-2 2h-.09a1.65 
                1.65 0 0 0-1.51 1z"
            />
          </svg>
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
