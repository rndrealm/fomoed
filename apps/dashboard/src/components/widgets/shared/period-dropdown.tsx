"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { CFGI_SUPPORTED_PERIODS_ENUM, OptionsType } from "@/constant/cfgi-data";
import { useGetUserPlans } from "@/services/queries/subscriptions";

interface ICoinDropdownProps {
  options: OptionsType[];
  value: string;
  setValue: (coin: string) => void;
}

const PeriodDropdown = (props: ICoinDropdownProps) => {
  const { options, value, setValue } = props;
  const { data: userPlans } = useGetUserPlans();

  const activePeriod = options.find((coin) => coin.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center h-8 gap-2 border rounded-sm cursor-pointer border-border-200 w-19 bg-widget-background-300">
          <div className="flex items-center gap-1">
            <h1 className="text-[13px] font-medium text-grey-400 font-inter">
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
            disabled={
              !userPlans?.hasPlan &&
              coin.value !== (CFGI_SUPPORTED_PERIODS_ENUM.DAY1 as string)
            }
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
