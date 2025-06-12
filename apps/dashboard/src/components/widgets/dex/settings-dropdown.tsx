"use client";
import React, { Fragment, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { cn } from "@/lib/utils";

interface IProps {
  slippage: {
    value: number;
    custom: boolean;
  };
  updateSlippage: (value: number, custom: boolean) => void;
}

export function SettingsDropdown(props: IProps) {
  const { slippage, updateSlippage } = props;

  const [errorText, setErrorText] = useState("");

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="">
            <Image src={dashboard.settingsV3} alt="Settings icon" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-[18.1875rem] rounded-[10px] bg-[#090909] border border-[#191919] px-[0.375rem] py-1"
          align="end"
        >
          <h1 className="py-2 font-semibold text-center text-white text-ideal">
            Swap Settings
          </h1>
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-1">
              <p className="text-ideal font-medium text-[#C3C3C3]">
                Max Slippage
              </p>
              <button
                title="Maximum slippage allowed for a swap."
                // className="cursor-help"
              >
                <Image src={dashboard.info} alt="Info icon" />
              </button>
            </div>
            <div className="relative font-medium text-white text-ideal">
              <input
                type="number"
                className={cn(
                  "h-[1.875rem] w-16 rounded-[8px] border-1 border-[#121212] bg-transparent pl-2 pr-6 "
                )}
                // placeholder="Custom"
                value={slippage.custom ? slippage.value : ""}
                maxLength={3}
                onChange={(e) => {
                  console.log(e);
                  if (e.target.value.length > 2) {
                  }
                  if (parseFloat(e.target.value) > 50) {
                    setErrorText("Slippage cannot be more than 50%");
                  } else if (e.target.value) {
                    setErrorText("");
                    updateSlippage(parseFloat(e.target.value), true);
                  } else {
                    setErrorText("");
                    updateSlippage(0.5, false);
                  }
                }}
              />
              <span className="absolute right-3 top-[16%]">%</span>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </Fragment>
  );
}
