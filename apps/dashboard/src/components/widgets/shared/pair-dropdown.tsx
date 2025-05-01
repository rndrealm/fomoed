"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { ExchangePairOption } from "@/charts/types";

interface ICoinDropdownProps {
  options: ExchangePairOption[];
  value: ExchangePairOption;
  setValue: (opt: ExchangePairOption) => void;
}

const PairDropdown = (props: ICoinDropdownProps) => {
  const { options, value, setValue } = props;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center h-8 gap-2 border rounded-sm cursor-pointer border-border-200 w-[10rem] bg-widget-background-300">
          <div className="flex items-center gap-1">
            <h1 className="text-[13px] font-medium text-grey-400 font-inter">
              {value?.label}
            </h1>
            <ChevronDown color="white" className="w-4 h-4" />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-[200px] bg-widget-background-200">
        {options.map((opt, i) => (
          <DropdownMenuCheckboxItem
            className="text-white focus:bg-widget-background focus:text-white"
            key={i}
            checked={value === opt}
            onCheckedChange={() => {
              setValue(opt);
            }}
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PairDropdown;
