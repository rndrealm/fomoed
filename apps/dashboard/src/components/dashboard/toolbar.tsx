import React from "react";
import {
  AddTab,
  Saved,
  Settings,
  TabLayout,
  ToolbarEditLayout,
  ToolbarLayout,
  Unsaved,
} from "../icons/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface IToolbarItem {
  onClick?: () => void;
  label?: string;
  icon: React.JSX.Element;
}

function ToolbarItem(props: IToolbarItem) {
  const { onClick, label, icon } = props;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger onClick={onClick}>
          <div className="h-[28px] w-[28px] flex items-center justify-center">
            {icon}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-[#101010]">
          <p className="text-[#afafaf] text-xs font-semibold leading-[1.25]">
            {label}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Toolbar() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2 items-center">
        <button
          type="button"
          className="h-[32px] w-[32px] flex items-center justify-center rounded-md border border-[#121212]"
        >
          <AddTab />
        </button>

        <div className="h-[18px] w-[1px] bg-[#141414]"></div>
        <button type="button">
          <div className="flex items-center gap-2 w-[130px] h-[32px] bg-[#111] px-[6px] rounded-md">
            <TabLayout />
            <p className="text-[#7a7a7a] text-xs font-medium flex-1 truncate">
              Untitled Layout
            </p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-[2px]">
          <div className="h-[28px] w-[28px] flex items-center justify-center bg-[#191919] rounded-md">
            <Saved active />
          </div>
          <div className="h-[28px] w-[28px] flex items-center justify-center bg-[#0d0d0d] rounded-md">
            <Unsaved />
          </div>
        </div>
        <ToolbarItem icon={<ToolbarEditLayout />} label="Edit Layout" />
        <ToolbarItem icon={<ToolbarLayout />} label="Layout" />
        <ToolbarItem icon={<Settings />} label="Settings" />
      </div>
    </div>
  );
}
