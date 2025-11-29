"use client";

import React, { useMemo, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import SearchIcon from "@/components/icons/SearchIcon";
import dashboard from "@/lib/assets/dashboard";

interface NetworkOption {
  name: string;
  icon: string;
}

interface INetworkDropdownProps {
  value?: string;
  setValue: (network: string) => void;
}

// Available networks
const NETWORKS: NetworkOption[] = [
  {
    name: "Ethereum",
    icon: "https://static.coinstats.app/coins/1650455629727.png"
  },
  {
    name: "Arbitrum",
    icon: "https://static.coinstats.app/coins/1687522892460.png"
  },
  {
    name: "Optimism",
    icon: "https://static.coinstats.app/coins/1664959117211.png"
  }
];

const NetworkDropdown = (props: INetworkDropdownProps) => {
  const { value = "Ethereum", setValue } = props;

  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);

  const activeNetwork = NETWORKS.find((network) => network.name === value);

  const filteredNetworks = useMemo(() => {
    if (!searchValue) return NETWORKS;

    const search = searchValue.toLowerCase();
    return NETWORKS.filter((network) =>
      network.name.toLowerCase().includes(search)
    );
  }, [searchValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 hover:bg-[#1a1b1f] px-3 py-2 rounded-[8px] transition-colors bg-[#1C1D21] border border-[#2B2C32] w-[220px] h-[40px]">
          {activeNetwork && (
            <div className="w-6 h-6 flex-shrink-0">
              <Image
                width={24}
                height={24}
                src={activeNetwork.icon}
                alt={activeNetwork.name}
                className="w-full h-full rounded-full"
              />
            </div>
          )}
          <span className="text-white text-[14px] flex-1 text-left">
            {activeNetwork?.name}
          </span>
          <ChevronDown className="w-4 h-4 text-[#84858C]" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="flex w-[220px] flex-col gap-2 rounded-[10px] border border-[#2B2C32] bg-[#121317] p-[7px_6px]"
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

          <CommandList className="flex flex-col gap-2 overflow-auto no-scrollbar max-h-[200px]">
            {filteredNetworks.map((network) => (
              <CommandItem
                key={network.name}
                className="flex cursor-pointer items-center justify-between rounded-[6px] px-[6px] py-[6px] hover:bg-[#1a1b1f] data-[selected=true]:bg-[#1a1b1f]"
                onSelect={() => {
                  setOpen(false);
                  setValue(network.name);
                  setSearchValue("");
                }}
              >
                <div className="flex items-center gap-2">
                  <Image
                    width={20}
                    height={20}
                    src={network.icon}
                    alt={network.name}
                    className="h-[20px] w-[20px] rounded-full"
                  />
                  <p className="text-[12px] font-medium text-[#c3c3c3] leading-none">
                    {network.name}
                  </p>
                </div>
                {network.name === activeNetwork?.name && (
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

export default NetworkDropdown;