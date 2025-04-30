import React from "react";
import { AddTab, TabLayout } from "../icons/icons";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  activeTabAtom,
  syncActiveTabAtom,
  tabsAtom,
} from "@/lib/atoms/layoutAtom";
import { cn } from "@/lib/utils";

export function NewTabs() {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const setSyncedActiveTab = useSetAtom(syncActiveTabAtom);
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  return (
    <div className="flex gap-2 items-center">
      <button
        type="button"
        className="h-[32px] w-[32px] flex items-center justify-center rounded-md border border-[#121212]"
        onClick={() => {
          const currentTab = {
            id: Date.now(),
            label: "untitled layout",
            name: "Untitled Layout",
            editMode: false,
          };
          setTabs((prev) => {
            return [...prev, currentTab];
          });
          setActiveTab(currentTab);
        }}
      >
        <AddTab />
      </button>

      <div className="h-[18px] w-[1px] bg-[#141414]"></div>

      {tabs.map((item) => {
        const isActive = activeTab.id === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActiveTab(item);
            }}
          >
            <div
              className={cn(
                "flex items-center gap-2 w-[130px] h-[32px] px-[6px] rounded-md",
                isActive ? "bg-[#252525]" : "bg-[#111]"
              )}
            >
              <TabLayout active={isActive} />
              <p
                className={cn(
                  "text-xs font-medium flex-1 truncate",
                  isActive ? "text-white" : "text-[#7a7a7a]"
                )}
              >
                {item.name}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
