"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { CfgiPeriodOption, CfgiPeriods } from "@/constant/cfgi-data";

interface ICoinDropdownProps {
  options: CfgiPeriodOption[];
  value: string;
  setValue: (coin: string) => void;
}

const PeriodDropdown = (props: ICoinDropdownProps) => {
  const { options, value, setValue } = props;

  const activePeriod = CfgiPeriods.find((coin) => coin.value === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center h-8 gap-2 border rounded-sm cursor-pointer border-border w-19">
          <div className="flex items-center gap-1">
            <h1 className="text-xs font-light text-grey-400 font-inter">
              {activePeriod?.label}
            </h1>
            <ChevronDown color="white" className="w-4 h-4" />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-[200px] bg-widget-background-200">
        {options.map((coin, i) => (
          <DropdownMenuCheckboxItem
            className="text-white focus:bg-widget-background focus:text-white"
            key={i}
            checked={value === coin.value}
            onCheckedChange={() => {
              setValue(coin.value);
            }}
          >
            {coin.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PeriodDropdown;
