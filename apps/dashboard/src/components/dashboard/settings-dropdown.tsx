import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Delete, SaveDraft, Settings } from "../icons/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function SettingsDropdown() {
  const [autosave, setAutosave] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipProvider>
      <DropdownMenu
        onOpenChange={(e) => {
          setIsOpen(e);
        }}
      >
        <Tooltip>
          <TooltipTrigger>
            <DropdownMenuTrigger asChild>
              <div className="h-[28px] w-[28px] flex items-center justify-center group">
                <Settings active={isOpen} />
              </div>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-[#101010]">
            <p className="text-[#afafaf] text-xs font-semibold leading-[1.25]">
              Settings
            </p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          className="w-[16rem] mt-2 bg-[#090909] border border-[#333]"
          align="end"
        >
          <DropdownMenuLabel className="text-[#646464] font-medium text-[10px] p-2 border-b border-[#333]">
            SETTINGS
          </DropdownMenuLabel>
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="text-[#C3C3C3] my-2 text-[13px] font-inter font-medium flex items-center focus:bg-[#171717] focus:text-[#C3C3C3] cursor-pointer w-full justify-between"
              onClick={() => {}}
            >
              <SaveDraft />
              <p className="flex-1">Save draft as layout</p>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-[#C3C3C3] my-2 text-[13px] font-inter font-medium flex items-center focus:bg-[#171717] focus:text-[#C3C3C3] cursor-pointer w-full justify-between"
              onClick={() => {}}
            >
              <Delete fill="#5B5B5B" />
              <p className="flex-1">Delete Draft</p>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-[#C3C3C3] my-2 text-[13px] font-inter font-medium flex items-center focus:bg-[#171717] focus:text-[#C3C3C3] cursor-pointer w-full justify-between"
              // onClick={() => {
              //   setAutosave(!autosave);
              // }}
              onSelect={(e) => {
                e.preventDefault();
                setAutosave(!autosave);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <p className="flex-1">Autosave layouts</p>

                <div
                  className={cn(
                    "flex items-center justify-center gap-1 p-[3px] rounded-lg border border-[#232323]",
                    autosave ? "bg-[#FF3B10] flex-row-reverse" : "bg-[#141414]"
                  )}
                >
                  <div
                    className={cn(
                      "w-[16px] h-[16px] rounded-sm",
                      autosave ? "bg-white" : "bg-[#373737]"
                    )}
                  ></div>
                  <p
                    className={cn(
                      "text-[8px] font-medium w-[16px] text-right",
                      autosave ? "text-white" : "text-[#9B9B9B]"
                    )}
                  >
                    {autosave ? "ON" : "OFF"}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
