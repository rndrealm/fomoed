"use client";

import React, { useMemo, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { RenderIf } from "@/components/shared";
import SearchIcon from "@/components/icons/SearchIcon";
import dashboard from "@/lib/assets/dashboard";

interface CoinOption {
  symbol: string;
  name: string;
  icon: string;
  type: string;
}

interface IChartCoinDropdownProps {
  value?: string;
  setValue: (coin: string) => void;
}

// Dummy data for now
const DUMMY_COINS: CoinOption[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "https://static.coinstats.app/coins/1650455588819.png",
    type: "Perp",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "https://static.coinstats.app/coins/1650455629727.png",
    type: "Perp",
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "https://static.coinstats.app/coins/1701234596791.png",
    type: "Perp",
  },
  {
    symbol: "XRP",
    name: "XRP",
    icon: "https://static.coinstats.app/coins/XRPdnqGJ.png",
    type: "Perp",
  },
];

const ChartCoinDropdown = (props: IChartCoinDropdownProps) => {
  const { value = "BTC", setValue } = props;

  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);

  const activeCoin = DUMMY_COINS.find((coin) => coin.symbol === value);

  const filteredCoins = useMemo(() => {
    if (!searchValue) return DUMMY_COINS;

    const search = searchValue.toLowerCase();

    return DUMMY_COINS.filter((coin) => {
      const nameMatch = coin.name.toLowerCase().includes(search);
      const symbolMatch = coin.symbol.toLowerCase().includes(search);
      return nameMatch || symbolMatch;
    });
  }, [searchValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 hover:bg-[#1a1b1f] px-2 py-1.5 rounded transition-colors">
          <RenderIf condition={!!activeCoin?.icon}>
            <div className="w-6 h-6 flex-shrink-0">
              <Image
                width={24}
                height={24}
                src={activeCoin?.icon || ""}
                alt="Coin Icon"
                className="w-full h-full rounded-full"
              />
            </div>
          </RenderIf>
          <span className="text-white font-medium text-sm">
            {activeCoin?.symbol} - {activeCoin?.type}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="flex w-[168px] h-[164px] flex-col gap-2 rounded-[10px] border border-[#2B2C32] bg-[#121317] p-[7px_6px]"
        align="start"
      >
        <Command className="bg-[#121317]">
          <div className="relative h-[34px] mb-[8px]">
            <div
              className="absolute top-1/2 left-[10px] flex h-[20px] w-[20px] items-center justify-center"
              style={{ transform: "translateY(-50%)" }}
            >
              <SearchIcon />
            </div>
            <input
              className="h-full w-full rounded-md border-none bg-[#1a1b1f] pl-[36px] text-[12px] font-medium text-[#d4d4d4] transition-all focus:outline-none focus:ring-0"
              placeholder="Search"
              onChange={(e) => setSearchValue(e.target.value)}
              ref={inputRef}
            />
          </div>

          <CommandList className="flex flex-col gap-2 overflow-auto no-scrollbar">
            {filteredCoins.map((item, index) => (
              <CommandItem
                key={index}
                className="flex cursor-pointer items-center justify-between rounded-[6px] px-[6px] py-[6px] hover:bg-[#1a1b1f] data-[selected=true]:bg-[#1a1b1f]"
                onSelect={() => {
                  setOpen(false);
                  setValue(item.symbol);
                }}
              >
                <div className="flex items-center gap-2">
                  <Image
                    width={20}
                    height={20}
                    src={item.icon || ""}
                    alt="Coin Icon"
                    className="h-[20px] w-[20px] rounded-full"
                  />
                  <p className="text-[12px] font-medium text-[#c3c3c3] leading-none">{item.name}</p>
                </div>
                {item.symbol === activeCoin?.symbol && (
                  <Image src={dashboard.checkV2} alt="Selected icon" width={12} height={12} />
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ChartCoinDropdown;
