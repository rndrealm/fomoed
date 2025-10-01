import React, { Fragment, useEffect, useMemo, useState } from "react";

import { CommandIcon, SpotlightSearch } from "@/components/icons/icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import SearchIcon from "@/components/icons/SearchIcon";
import { ShortcutItem } from "@/components/dashboard/shared/keyboard-shortcuts/shortcut-item";

const shortcuts = [
  {
    title: "General",
    items: [
      { name: "Command Menu", keys: ["control", "K"] },
      { name: "Save Submit", keys: ["Enter"] },
      { name: "Back", keys: ["Esc"] },
      { name: "Open Search", keys: ["/"] },
      { name: "Open Help center", keys: ["?"] },
      { name: "View Keyboard Shortcuts", keys: ["control", "/"] },
      { name: "Logout", keys: ["control", "K", "O"] },
    ],
  },
  {
    title: "Trading Dashboard",
    items: [
      { name: "Add widget", keys: ["control", "A"] },
      { name: "Delete Widget", keys: ["Del"] },
      { name: "Switch Tabs", keys: ["Shf"] },
      { name: "Add DEX", keys: ["L"] },
    ],
  },
];

const KeyboardShortcutsBox = () => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="scrollbar mx-auto max-w-[620px] flex-1 w-full flex flex-col gap-6 bg-[#131313] px-6 md:px-10 pb-6 pt-13 overflow-y-auto">
      <h3 className="px-2 text-base text-white font-medium">Keyboard Shortcuts</h3>
      <Command className="bg-[#131313] pb-10 max-h-[800px] h-full">
        {/* command input */}
        <div className="pb-3">
          <CommandInput
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder="Search shortcuts"
            className="max-h-[56px] m-0 px-4 py-2 w-full max-w-[300px] rounded-[8px] border-[1px] border-[#222222] bg-[#111111] text-[14px] font-medium text-white transition-all placeholder:text-[#626262] focus:shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 [&:focus]:outline-none [&:focus-visible]:outline-none"
          />
        </div>

        <CommandList className="scrollbar pt-0 max-h-[450px]">
          <CommandEmpty className="px-0 py-0">
            <div className="flex flex-col px-2 py-2 gap-0 items-start justify-between bg-[#141414]">
              <p className="px-3 pt-2 pb-3 text-xs text-[#A4A4A4]">Search results for {`"` + searchValue + `"`}</p>
              <div className="relative h-[40px] flex w-full px-3 items-center gap-1">
                <div className="flex flex-row gap-3 items-center">
                  <p className="text-[14px] leading-[18px] font-normal text-white">
                    No result found
                    <span className="ml-1.5 text-xs text-[#A4A4A4]">Make a suggestion to us</span>
                  </p>
                </div>

                {/* right suggestion */}
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-not-allowed px-1.5 py-1 bg-[#1A1A1A] border-[1px] border-[#242424] rounded-[6px]">
                  <p className="text-xs leading-[18px] font-normal text-[#A6AEB2]">Make suggestion</p>
                </div>
              </div>
            </div>
          </CommandEmpty>
          {shortcuts?.map((section, index) => {
            return (
              <CommandGroup
                key={index}
                className="flex flex-col gap-0 px-2 pb-2 pt-0 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-3 [&_[cmdk-group-heading]]:leading-[16px] [&_[cmdk-group-heading]]:text-white [&_[cmdk-group-heading]]:text-[14px]"
                heading={section.title}
              >
                {/* tab item */}
                {section?.items?.map((shortcutTab) => {
                  return (
                    <CommandItem
                      key={shortcutTab.name}
                      className="group cursor-pointer p-0 max-h-[40px] rounded-[8px] data-[selected=true]:bg-[#1A1A1A] data-[selected=true]:border-[0px] data-[selected=true]:border-[#242424]"
                      onSelect={() => {
                        return;
                      }}
                    >
                      <div className="w-full h-full px-3 py-2 flex flex-row items-center justify-between gap-2">
                        <p className="text-[14px] leading-[18px] font-normal text-[#a4a4a4]">{shortcutTab.name}</p>

                        <div key={index} className="flex flex-row gap-1">
                          {shortcutTab?.keys.map((key, index) => {
                            if (key === "control") {
                              return (
                                <span
                                  key={index}
                                  className="min-h-[28px] px-1 text-[13px] leading-[18px] font-normal text-[#BEBEBE] flex items-center justify-center rounded-[4px] bg-[#1A1A1A] border-[1px] border-[#242424]"
                                >
                                  <CommandIcon fill="#A6AEB2" />
                                </span>
                              );
                            } else {
                              return (
                                <span
                                  key={index}
                                  className="min-h-[28px] px-2 text-[13px] leading-[18px] font-normal text-[#BEBEBE] flex items-center justify-center rounded-[4px] bg-[#1A1A1A] border-[1px] border-[#242424]"
                                >
                                  {key}
                                </span>
                              );
                            }
                          })}
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
          })}
        </CommandList>
      </Command>
    </div>
  );
};

export default KeyboardShortcutsBox;
