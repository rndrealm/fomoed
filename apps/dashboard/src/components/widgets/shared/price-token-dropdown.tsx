import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { RenderIf } from "@/components/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CoinDataInterface } from "@/services/queries/charts/types";
import { ChevronDown } from "lucide-react";
import SearchIcon from "@/components/icons/SearchIcon";

interface IProps {
  options: CoinDataInterface[];
  value?: string;
  setValue: (coin: string) => void;
}

export default function PriceTokenDropdown(props: IProps) {
  const { options = [], setValue, value } = props;

  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (open) {
      setSearchValue("");
      // Slight delay ensures the input is mounted
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [open]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <div className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
          <div className="flex-shrink-0">
            <div className="w-[40px] h-[40px]">
              <RenderIf condition={!!activeCoin?.icon}>
                <Image
                  width={40}
                  height={40}
                  src={activeCoin?.icon || ""}
                  alt="Coin Icon"
                  className="w-[40px] h-[40px]"
                />
              </RenderIf>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-left text-white">
              {activeCoin?.symbol}
            </p>
            <ChevronDown color="white" className="w-4 h-4" />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[211px] h-[174px] bg-[#090909] border border-[#121212] flex flex-col gap-2 p-[6px] overflow-hidden"
        align="start"
      >
        <div className="">
          <div className="h-[34px] relative">
            <div
              className="w-[20px] h-[20px] absolute left-[10px] top-[50%] flex items-center justify-center"
              style={{ transform: "translateY(-50%)" }}
            >
              <SearchIcon />
            </div>
            <input
              className="w-full h-full bg-[#121212] rounded-md font-medium text-[#d4d4d4] text-[13px] pl-[36px] focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none [&:focus-visible]:outline-none [&:focus]:outline-none transition-all w-full border-none focus-visible:ring-0"
              placeholder="Search"
              onChange={(e) => setSearchValue(e.target.value)}
              ref={inputRef}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1 overflow-auto">
          {filteredCoins.map((item, index) => (
            <button
              key={index}
              className="px-2 py-[7px] flex gap-2 items-center bg-[transparent] cursor-pointer focus:bg-[#171717]"
              onClick={() => {
                setValue(item.symbol);
                setOpen(false);
              }}
            >
              <div className="w-[20px] h-[20px]">
                <Image
                  width={20}
                  height={20}
                  src={item?.icon || ""}
                  alt="Coin Icon"
                  className="w-full h-full"
                />
              </div>
              <p className="text-[#c3c3c3] text-[13px] text-left font-medium leading-[1.25] flex-1 line-clamp-1">
                {item.name}
              </p>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
