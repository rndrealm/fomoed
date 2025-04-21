"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CoinDataInterface } from "@/services/queries/charts/types";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cfgi_supported_tokens } from "@/constant/cfgi-data";

interface ICoinDropdownProps {
  options: CoinDataInterface[];
  value: string;
  setValue: (coin: string) => void;
}

const CoinDropdown = (props: ICoinDropdownProps) => {
  const { options, value, setValue } = props;

  const activeCoin = options.find((coin) => coin.symbol === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 cursor-pointer">
          <div>
            <Image
              width={32}
              height={32}
              src={activeCoin?.icon || ""}
              alt="Coin Icon"
            />
          </div>
          <div>
            <h1 className="text-base font-medium text-white font-inter">
              Fear and Greed Chart
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-xs font-light text-left text-white font-inter">
                {value}
              </p>
              <ChevronDown color="white" className="w-4 h-4" />
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-[200px]">
        {options
          .filter((fl) => cfgi_supported_tokens.includes(fl.symbol))
          .map((coin, i) => (
            <DropdownMenuCheckboxItem
              key={i}
              checked={value === coin.symbol}
              onCheckedChange={() => {
                setValue(coin.symbol);
              }}
            >
              {coin.name}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CoinDropdown;
