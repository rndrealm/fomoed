import React from "react";
import {
  activeTabAtom,
  syncActiveTabAtom,
  tabsAtom,
} from "@/lib/atoms/layoutAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { cn } from "@/lib/utils";

export function Tabs() {
  const tabs = useAtomValue(tabsAtom);
  const setSyncedActiveTab = useSetAtom(syncActiveTabAtom);
  const activeTab = useAtomValue(activeTabAtom);

  return (
    <div className="flex items-center gap-4">
      {tabs.map((item) => {
        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              "pb-1",
              activeTab.id === item.id ? "border-b border-white" : ""
            )}
            onClick={() => {
              setSyncedActiveTab(item);
            }}
          >
            <p
              className={cn(
                "text-xs leading-[150%] font-medium uppercase",
                activeTab.id === item.id ? "text-white" : "text-[#7A7A7A]"
              )}
            >
              {item.name}
            </p>
          </button>
        );
      })}
    </div>
  );
}
