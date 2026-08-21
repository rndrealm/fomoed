import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { RenderIf } from "@/components/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CoinDataInterface,
  CoinStatsTokenInfo,
} from "@/services/queries/charts/types";
import { ChevronDown } from "lucide-react";
import SearchIcon from "@/components/icons/SearchIcon";
import { useGetUserPlans } from "@/services/queries/subscriptions";

interface IProps {
  options: CoinStatsTokenInfo[];
  value?: string;
  setValue: (coin: string) => void;
  align?: "center" | "end" | "start" | undefined;
}

export default function CoinDropdown(props: IProps) {
  const { options = [], setValue, value, align = "center" } = props;

  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);

  const { data: userPlans } = useGetUserPlans();

  const inputRef = useRef<HTMLInputElement>(null);

  const activeCoin = options.find((coin) => coin.id === value);

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
        <div className="flex items-center justify-between gap-1 cursor-pointer whitespace-nowrap bg-[#141414] rounded-lg py-2 px-[10px]">
          <div className="flex items-center gap-1">
            <div className="">
              <div className="w-[15px] h-[15px]">
                <RenderIf condition={!!activeCoin?.icon}>
                  <Image
                    width={15}
                    height={15}
                    src={activeCoin?.icon || ""}
                    alt="Coin Icon"
                    className="w-[15px] h-[15px]"
                  />
                </RenderIf>
              </div>
            </div>
            <p className="text-[13px] font-medium text-[#c3c3c3] select-none">
              {activeCoin?.symbol}
            </p>
          </div>

          <div className="">
            <ChevronDown color="white" className="w-4 h-4" />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[211px] h-[174px] bg-[#090909] border border-[#121212] flex flex-col gap-2 p-[6px] overflow-hidden"
        align={align}
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

        <div className="flex flex-col flex-1 gap-2 overflow-auto scrollbar">
          {filteredCoins.map((item, index) => (
            <button
              key={index}
              className="px-2 py-[7px] flex gap-2 items-center bg-[transparent] cursor-pointer focus:bg-[#171717]"
              onClick={() => {
                setValue(item.id);
                setOpen(false);
              }}
              disabled={false}
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
                {item.symbol}
              </p>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
