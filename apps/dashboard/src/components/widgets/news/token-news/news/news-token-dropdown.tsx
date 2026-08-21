import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { RenderIf } from "@/components/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CoinDataInterface } from "@/services/queries/charts/types";
import { ChevronDown } from "lucide-react";
import SearchIcon from "@/components/icons/SearchIcon";
import CaretDown from "@/components/icons/CaretDown";
import { formatPriceSignificant } from "@/lib/utils";
import { useGetUserPlans } from "@/services/queries/subscriptions";

interface IProps {
  options: CoinDataInterface[];
  value?: string;
  setValue: (coin: string) => void;
  align?: "center" | "end" | "start" | undefined;
}

export function NewsTokenDropdown(props: IProps) {
  const { options = [], setValue, value, align = "center" } = props;

  const { data: userPlans } = useGetUserPlans();

  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const activeCoin = options.find((coin) => coin.symbol === value);

  const priceChange = activeCoin?.priceChange || 0;
  const price = activeCoin?.price || 0;

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
    <div className="flex flex-col">
      <div className="flex">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>
            <div className="flex items-center justify-start gap-1">
              <p className="text-[20px] leading-[1.35] font-bold text-white">
                {activeCoin?.name}
              </p>
              <div className="flex h-[20px] w-[20px] items-center justify-center">
                <CaretDown />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="flex h-[174px] w-[211px] flex-col gap-2 overflow-hidden border border-[#121212] bg-[#090909] p-[6px]"
            align={align}
          >
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

            <div className="scrollbar flex flex-1 flex-col gap-2 overflow-auto">
              {filteredCoins.map((item, index) => (
                <button
                  key={index}
                  className="flex cursor-pointer items-center gap-2 bg-[transparent] px-2 py-[7px] focus:bg-[#171717]"
                  onClick={() => {
                    setValue(item.symbol);
                    setOpen(false);
                  }}
                  disabled={false}
                >
                  <div className="h-[20px] w-[20px]">
                    <Image
                      width={20}
                      height={20}
                      src={item?.icon || ""}
                      alt="Coin Icon"
                      className="h-full w-full"
                    />
                  </div>
                  <p className="line-clamp-1 flex-1 text-left text-[13px] leading-[1.25] font-medium text-[#c3c3c3]">
                    {item.symbol}
                  </p>
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-base leading-[24px] font-medium text-[#BABABA]">
          {formatPriceSignificant(activeCoin?.price || 0)}
        </p>
        <RenderIf
          condition={!!activeCoin?.priceChange && activeCoin?.priceChange > 0}
        >
          <p className="text-sm leading-[1.35] font-bold text-[#84EBB4]">
            +${formatPriceSignificant(price * (priceChange / 100), 2)}
          </p>
        </RenderIf>

        <RenderIf
          condition={!!activeCoin?.priceChange && activeCoin?.priceChange < 0}
        >
          <p className="text-sm leading-[1.35] font-bold text-[#ff8970]">
            -${formatPriceSignificant(Math.abs(price * (priceChange / 100)), 2)}
          </p>
        </RenderIf>
      </div>
      <p className="text-[13px] leading-[18px] font-semibold text-[#888888]">
        {priceChange > 0 ? `Up ${priceChange}%` : `Down ${priceChange}%`}
      </p>
    </div>
  );
}
