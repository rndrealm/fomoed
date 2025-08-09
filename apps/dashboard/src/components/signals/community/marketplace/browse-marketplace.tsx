"use client";
import React, { useState } from "react";
import CaretDown from "@/components/icons/CaretDown";
import { Check, SmartSignals } from "@/components/icons/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RenderIf } from "@/components/shared";

const AllTypesOptions = [
  { id: 1, label: "Indicators", value: "indicators" },
  { id: 2, label: "Liquidity heat map", value: "liquidity_heat_map" },
  { id: 3, label: "Price Charts", value: "price_charts" },
  { id: 4, label: "Open Difference", value: "open_difference" },
];

function AllTypes() {
  const [selected, setSelected] = useState("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="py-[6px] pl-[14px] pr-[10px] flex items-center gap-4 bg-[#181818] rounded-sm">
          <p className="text-[#D4D4D4] tracking-[-0.4%] leading-[1.35] text-sm">
            All Types
          </p>
          <div className="w-[16px] h-[16px] flex justify-center items-center">
            <CaretDown />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-[#0A0A0A] border border-[#262626] p-1"
      >
        {AllTypesOptions.map((option) => (
          <DropdownMenuItem
            key={option.id}
            className="focus:bg-[#171717] focus:text-[#fafafa]"
            onSelect={() => setSelected(option.value)}
          >
            <div className="flex items-center gap-1 px-2 py-[6px]">
              <div className="w-[20px] h-[20px] flex justify-center items-center">
                <RenderIf condition={selected === option.value}>
                  <Check />
                </RenderIf>
              </div>
              <p className="text-[#D4D4D4] tracking-[-0.4%] leading-[1.35] text-sm">
                {option.label}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BrowseMarketplace() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-white tracking-[-0.4%] leading-[1.35] text-xl font-medium">
          Browse Marketplace
        </h2>

        <p className="text-[#D4D4D4] tracking-[-0.4%] leading-[1.35] text-sm">
          Discover Signal templates from the biggest traders on the planet with
          reviews from your peers, created to help you be more profitable.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="py-[6px] pl-[14px] pr-[10px] flex items-center gap-4 border border-[#232323] rounded-sm">
          <div className="w-[16px] h-[16px] flex justify-center items-center">
            <SmartSignals />
          </div>

          <p className="text-[#D4D4D4] tracking-[-0.4%] leading-[1.35] text-sm">
            Smart Signals
          </p>

          <div className="w-[16px] h-[16px] flex justify-center items-center">
            <CaretDown />
          </div>
        </div>

        <div className="py-[6px] pl-[14px] pr-[10px] flex items-center gap-4 bg-[#181818] rounded-sm">
          <div className="w-[16px] h-[16px] flex justify-center items-center">
            <SmartSignals />
          </div>

          <p className="text-[#D4D4D4] tracking-[-0.4%] leading-[1.35] text-sm">
            Widgets
          </p>

          <div className="w-[16px] h-[16px] flex justify-center items-center">
            <CaretDown />
          </div>
        </div>

        <AllTypes />
      </div>
    </div>
  );
}
