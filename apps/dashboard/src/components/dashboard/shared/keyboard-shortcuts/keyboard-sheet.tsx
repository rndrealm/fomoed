import React, { Fragment, useMemo, useState } from "react";
import SearchIcon from "@/components/icons/SearchIcon";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { keyboardShortcutsSheetVisible, toggleKeyboardShortcutsSheetAtom } from "@/lib/atoms/shortcuts";
import { useAtomValue, useSetAtom } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";
import { ShortcutKey } from "./shortcut-key";
import { RenderIf } from "@/components/shared";

const data = [
  {
    id: 1,
    category: "Widget Dashboard",
    shortcuts: [
      { id: 1, action: "Open Spotlight", keys: ["Cmd", "K"] },
      { id: 2, action: "View keyboard shortcuts", keys: ["Cmd", "/"] },
      { id: 3, action: "Sign Out", keys: ["Alt|Option", "Shift", "Q"] },
    ],
  },

  {
    id: 2,
    category: "Widgets",
    shortcuts: [
      { id: 1, action: "Add Widget", keys: ["C"] },
      { id: 2, action: "Clear All Widgets", keys: ["Cmd", "C"] },
    ],
  },

  {
    id: 3,
    category: "Tabs",
    shortcuts: [
      { id: 1, action: "Add New Tab", keys: ["T"] },
      { id: 2, action: "Remove Current Tab", keys: ["Cmd", "Del"] },
      { id: 3, action: "Remove All Tabs", keys: ["Cmd", "Ctrl", "Del"] },
    ],
  },

  {
    id: 4,
    category: "Navigation",
    shortcuts: [
      { id: 1, action: "Go to News", keys: ["G", "then", "N"] },
      // { id: 2, action: "Open Spotlight", keys: ["Cmd", "K"] },
      // { id: 3, action: "Open Spotlight", keys: ["Cmd", "K"] },
    ],
  },
];

export function KeyboardSheet() {
  // show keyboard shortcut sheet
  const toggleKeyboardShortcutSheet = useSetAtom(toggleKeyboardShortcutsSheetAtom);
  const showKeyboardShortcutSheet = useAtomValue(keyboardShortcutsSheetVisible);

  const [searchValue, setSearchValue] = useState("");

  useHotkeys("metaKey+Slash, ctrl+Slash", () => {
    toggleKeyboardShortcutSheet(true);
  });

  const filteredData = useMemo(() => {
    if (!searchValue.trim()) return data;

    const search = searchValue.toLowerCase();

    return data
      .map((section) => {
        const categoryMatch = section.category.toLowerCase().includes(search);

        if (categoryMatch) {
          // Show the whole category with all its shortcuts
          return section;
        }

        const filteredShortcuts = section.shortcuts.filter((shortcut) => {
          const actionMatch = shortcut.action.toLowerCase().includes(search);
          const keysMatch = shortcut.keys.join(" ").toLowerCase().includes(search);
          return actionMatch || keysMatch;
        });

        return filteredShortcuts.length > 0 ? { ...section, shortcuts: filteredShortcuts } : null;
      })
      .filter(Boolean);
  }, [searchValue]);

  return (
    <Sheet
      open={showKeyboardShortcutSheet}
      onOpenChange={(open) => {
        toggleKeyboardShortcutSheet(open);
      }}
    >
      {/* <SheetTrigger>Open</SheetTrigger> */}
      <SheetContent className="!top-4 right-4 !bottom-4 h-[unset] w-[437px] gap-6 overflow-hidden rounded-[10px] border border-[#2A2A2A] bg-[#1C1D1F] pt-8">
        <SheetHeader className="gap-4 p-0 px-6">
          <SheetTitle className="text-[18px] leading-[26px] font-medium tracking-[-1.5%] text-white">
            Keyboard Shortcuts
          </SheetTitle>

          <div className="relative flex-1 rounded-xl border border-[#212121] bg-[#000000]">
            <span className="absolute top-[50%] left-[16px] -translate-y-1/2">
              <SearchIcon />
            </span>
            <Input
              placeholder="Search Shortcuts"
              className="h-[40px] w-full rounded-[4px] border border-none border-white/10 bg-transparent py-[1px] pr-[9px] pl-9 text-xs leading-[16px] text-white transition-all placeholder:text-white/40 focus:shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 [&:focus]:outline-none [&:focus-visible]:outline-none"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </SheetHeader>
        <div className="scrollbar flex flex-1 flex-col gap-6 overflow-y-auto px-6 pt-4 pb-8">
          <RenderIf condition={filteredData?.length === 0}>
            <p className="text-sm leading-[1] font-medium tracking-[-1.5%] text-[#A4A4A4]">
              No matching shortcuts found
            </p>
          </RenderIf>
          {filteredData?.map((item) => {
            return (
              <div key={item?.id} className="flex flex-col gap-5">
                <h3 className="text-base leading-[24px] font-medium tracking-[-1.5%] text-white">{item?.category}</h3>
                {item?.shortcuts?.map((shortcut) => {
                  return (
                    <div key={shortcut?.id} className="flex items-center justify-between">
                      <p className="text-sm leading-[1] font-medium tracking-[-1.5%] text-[#A4A4A4]">
                        {shortcut.action}
                      </p>

                      <div className="flex items-center gap-1">
                        {shortcut?.keys?.map((letter, index) => (
                          <ShortcutKey key={index} className="bg-[#2E2E2E]" letter={letter} isKey={letter !== "then"} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
