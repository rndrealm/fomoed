import CaretDown from "@/components/icons/CaretDown";
import { CommandIcon } from "@/components/icons/icons";
import SearchIcon from "@/components/icons/SearchIcon";
import { Input } from "@/components/ui/input";
import React from "react";

export function Header() {
  return (
    <div className="px-6 py-3 flex items-center justify-between border-b border-[#141414]">
      <div className="flex gap-2 items-center">
        <button className="w-[20px] h-[20px] flex items-center justify-center rotate-90">
          <CaretDown stroke="#fff" />
        </button>

        <button className="w-[20px] h-[20px] flex items-center justify-center rotate-270">
          <CaretDown stroke="#737373" />
        </button>
      </div>
      <div className="flex h-[32px] max-w-[357px] w-full items-center bg-[#171717] rounded-lg border border-[#262626]">
        <div className="w-[32px] h-[32px] flex items-center justify-center border-r border-[#262626]">
          <SearchIcon color="#FFFFFF" />
        </div>

        <div className="relative w-full flex-1 h-full">
          <div className="absolute top-0 bottom-0 right-[8px] flex items-center gap-1 justify-center">
            <CommandIcon />
            <p className="text-sm leading-[20px] text-[#525252]">K</p>
          </div>
          <Input
            placeholder="Search Marketplace and Tools"
            className="h-full w-full border border-none !bg-transparent py-[1px] text-xs pr-10 leading-[16px] text-white transition-all placeholder:text-white/40 focus:shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 [&:focus]:outline-none [&:focus-visible]:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2 items-center invisible">
        <button className="w-[20px] h-[20px] flex items-center justify-center rotate-90">
          <CaretDown stroke="#fff" />
        </button>

        <button className="w-[20px] h-[20px] flex items-center justify-center rotate-270">
          <CaretDown stroke="#737373" />
        </button>
      </div>
    </div>
  );
}
