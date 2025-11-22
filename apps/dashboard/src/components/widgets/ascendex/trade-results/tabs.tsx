import { cn } from "@/lib/utils";
import React from "react";

const tabData = [
  {
    id: 1,
    label: "Balances",
    value: "balance",
  },
  {
    id: 2,
    label: "Open Orders",
    value: "open-orders",
  },
  {
    id: 3,
    label: "Trade History",
    value: "trade-history",
  },
];

interface IProps {
  updateTab: (tab: string) => void;
  currTab: string;
}

const Tabs = (props: IProps) => {
  const { updateTab, currTab } = props;
  return (
    <div className="px-3 py-2 flex items-center gap-1">
      {tabData.map((tab, i) => {
        return (
          <button
            key={i}
            onClick={() => updateTab(tab.value)}
            className={cn("text-[#84858C] font-medium text-xs rounded-[6px] px-3 py-1", {
              "bg-[#222329] text-white": tab.value === currTab,
            })}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
