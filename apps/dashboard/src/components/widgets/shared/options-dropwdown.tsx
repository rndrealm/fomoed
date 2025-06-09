"use client";
import { Delete, Ellipsis } from "@/components/icons/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

export function OptionsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="w-[24px] h-[24px] flex items-center justify-center"
        >
          <Ellipsis />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[210px] rounded-lg bg-[#090909] border border-[#333]"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text-[#D4D4D4] text-[13px] leading-[1.25] p-[10px] font-normal focus:bg-[#171717] focus:text-[#C3C3C3] cursor-pointer w-full flex items-center justify-between"
            onSelect={(e) => {
              e.preventDefault();
            }}
          >
            Delete widget
            <Delete fill="#A2A2A2" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
