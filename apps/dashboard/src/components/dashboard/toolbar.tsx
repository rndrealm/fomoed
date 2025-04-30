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
import { NewTabs } from "./new-tab";

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
      <NewTabs />

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
