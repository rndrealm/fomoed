"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { CoinDataInterface } from "@/services/queries/charts/types";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cfgi_supported_tokens } from "@/constant/cfgi-data";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { RenderIf } from "@/components/shared";
import SearchIcon from "@/components/icons/SearchIcon";
import dashboard from "@/lib/assets/dashboard";

interface ICoinDropdownProps {
  options: CoinDataInterface[];
  value?: string;
  setValue: (coin: string) => void;
  title: string;
}

const CoinDropdown = (props: ICoinDropdownProps) => {
  const { options, value = "BTC", setValue, title } = props;
  const { data: userPlans } = useGetUserPlans();

  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);

  const activeCoin = options.find((coin) => coin.symbol === value);

  const filteredCoins = useMemo(() => {
    if (!searchValue) return options;

    const search = searchValue.toLowerCase();

    return options.filter((coin) => {
      const nameMatch = coin.name.toLowerCase().includes(search);
      const symbolMatch = coin.symbol.toLowerCase().includes(search);
      return nameMatch || symbolMatch;
    });
  }, [searchValue, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex cursor-pointer items-center gap-2 whitespace-nowrap min-w-max">
          <div className="flex-shrink-0">
            <RenderIf condition={!!activeCoin?.icon}>
              <Image width={32} height={32} src={activeCoin?.icon || ""} alt="Coin Icon" />
            </RenderIf>
          </div>
          <div>
            <h1 className="font-inter text-base font-medium text-white">{title}</h1>
            <div className="flex items-center gap-2">
              <p className="font-inter text-left text-xs font-light text-white">{value}</p>
              <ChevronDown color="white" className="h-4 w-4" />
            </div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="flex h-[174px] w-[211px] flex-col gap-2 overflow-hidden border border-[#121212] bg-[#090909] p-[6px]"
        align="start"
      >
        <Command className="bg-[#090909]">
          <div className="">
            <div className="relative h-[34px]">
              <div
                className="absolute top-[50%] left-[10px] flex h-[20px] w-[20px] items-center justify-center"
                style={{ transform: "translateY(-50%)" }}
              >
                <SearchIcon />
              </div>
              <input
                className="h-full w-full rounded-md border-none bg-[#121212] pl-[36px] text-[13px] font-medium text-[#d4d4d4] transition-all focus:shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 [&:focus]:outline-none [&:focus-visible]:outline-none"
                placeholder="Search"
                onChange={(e) => setSearchValue(e.target.value)}
                ref={inputRef}
              />
            </div>
          </div>
          <CommandList>
            <div className="scrollbar mt-1 flex flex-1 flex-col gap-2 overflow-auto">
              {filteredCoins.map((item, index) => (
                <CommandItem
                  key={index}
                  className="flex cursor-pointer items-center justify-between bg-[transparent] px-2 py-[7px] data-[selected=true]:bg-[#171717]"
                  onSelect={() => {
                    setOpen(false);
                    setValue(item.symbol);
                  }}
                  disabled={!userPlans?.hasPlan && item.symbol !== "BTC" && item.symbol !== "ETH"}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-[20px] w-[20px]">
                      <Image width={20} height={20} src={item?.icon || ""} alt="Coin Icon" className="h-full w-full" />
                    </div>
                    <p className="line-clamp-1 flex-1 text-left text-[13px] leading-[1.25] font-medium text-[#c3c3c3]">
                      {item.name}
                    </p>
                  </div>
                  {item.symbol === activeCoin?.symbol ? (
                    <div>
                      <Image src={dashboard.checkV2} alt="Selected icon" width={12} height={12} />
                    </div>
                  ) : null}
                </CommandItem>
              ))}
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CoinDropdown;
