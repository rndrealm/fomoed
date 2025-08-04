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
import { cn } from "@/lib/utils";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";

interface ICoinDropdownProps {
  options: OptionsType[];
  value: string;
  setValue: (coin: string) => void;
  triggerClassName?: string;
}

const PeriodDropdown = (props: ICoinDropdownProps) => {
  const { options, value, setValue, triggerClassName } = props;
  const { data: userPlans } = useGetUserPlans();

  const activePeriod = options.find((coin) => coin.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "border-border-200 bg-widget-background-300 flex h-8 w-19 cursor-pointer items-center justify-center gap-2 rounded-sm border",
            triggerClassName
          )}
        >
          <div className="flex items-center gap-1">
            <h1 className="text-grey-400 font-inter text-[13px] font-medium">{activePeriod?.label}</h1>
            <ChevronDown color="white" className="w-4 h-4" />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-[200px] w-56 bg-[#090909]" align="end">
        {options.map((period, i) => (
          <DropdownMenuCheckboxItem
            className="justify-between text-white focus:bg-widget-background focus:text-white"
            key={i}
            // checked={value === period.value}
            onCheckedChange={() => {
              setValue(period.value);
            }}
          >
            <p>{period.label}</p>
            {period.value === value ? (
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

export default PeriodDropdown;
