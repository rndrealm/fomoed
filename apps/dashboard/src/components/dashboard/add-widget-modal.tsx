import React, { useState } from "react";
import { Input } from "../ui/input";
import SearchIcon from "../icons/SearchIcon";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import CaretDown from "../icons/CaretDown";
import { cn } from "@/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { widgetsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";

const widgets = [
  { id: "cfgi-chart", name: "CFGI Chart" },
  { id: "price-chart", name: "Price Chart" },
  { id: "btc-chart", name: "Btc Chart" },
];

const categoryOptions = [
  { id: 1, label: "All", value: "all" },
  { id: 2, label: "Category", value: "category" },
  { id: 3, label: "Category", value: "category2" },
  { id: 4, label: "Category", value: "category3" },
];

export function AddWidgetModal() {
  const [activeCategory, setActiveCategory] = useState(
    categoryOptions[0].value
  );

  const setWidget = useSetAtom(widgetsAtom);
  const activeTab = useAtomValue(activeTabAtom);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute left-2 top-[50%] -translate-y-1/2">
              <SearchIcon />
            </span>
            <Input
              placeholder="Search Widgets"
              className="h-[32px] pl-7 pr-[9px] py-[1px] rounded-[4px] border border-white/10 text-sm placeholder:text-white/40 bg-transparent text-white
    focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none focus:border-white/15 focus:bg-white/2
    [&:focus-visible]:outline-none [&:focus]:outline-none transition-all w-full"
            />
          </div>

          <button type="button">
            <div className="flex gap-2 items-center px-2 bg-[#171A1C] rounded-sm h-[32px]">
              <p className="text-[#717a7a] text-xs">Filter by size</p>
              <CaretDown />
            </div>
          </button>
        </div>

        <p className="text-white text-xs">
          Select from the list of widgets below
        </p>
      </div>

      <div className="flex gap-4 items-center border-b border-[rgba(236,42,0,0.2)]">
        {categoryOptions.map((item) => {
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveCategory(item.value);
              }}
            >
              <p
                className={cn(
                  "font-normal text-xs leading-[133%] uppercase text-center border-b border-transparent pb-1",
                  activeCategory === item.value
                    ? "text-[#FF3B10] border-[#FF3B10]"
                    : "text-[#717A7A]"
                )}
              >
                {item.label}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {widgets.map((item) => {
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setWidget((prev) => {
                  return {
                    ...prev,
                    [activeTab.id]: [...(prev[activeTab.id] || []), item],
                  };
                });
              }}
            >
              <div className="flex flex-col gap-1">
                <div className="bg-[#000] rounded-lg">
                  <Image
                    src={dashboard.layoutPlaceholder}
                    alt="placeholder"
                    className="invisible"
                  />
                </div>
                <p className="text-center text-xs text-white">{item.name}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
