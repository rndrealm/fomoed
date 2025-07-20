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
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";

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
        <button className="border-border-200 bg-widget-background-300 flex h-8 w-[10rem] cursor-pointer items-center justify-center gap-2 rounded-sm border">
          <div className="flex items-center gap-1">
            <h1 className="text-grey-400 font-inter text-[13px] font-medium">{value?.label}</h1>
            <ChevronDown color="white" className="w-4 h-4" />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-[200px] w-56 bg-[#090909]">
        {options.map((opt, i) => (
          <DropdownMenuCheckboxItem
            className="justify-between px-4 text-white focus:bg-widget-background focus:text-white"
            key={i}
            onCheckedChange={() => {
              setValue(opt);
            }}
          >
            <p className="font-inter">{opt.label}</p>
            {opt === value ? (
              <div>
                <Image src={dashboard.checkV2} alt="Selected icon" width={12} height={12} />
              </div>
            ) : null}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PairDropdown;
