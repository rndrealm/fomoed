import React, { Fragment, useState } from "react";
import {
  AddWidget,
  Saved,
  Settings,
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
import { ModalContainer } from "../shared";
import { QuickWidgets } from "./quick-widgets";

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
  const [showWidgetsModal, setShowWidgetsModal] = useState(false);

  return (
    <Fragment>
      <div className="flex items-center justify-between gap-4">
        <NewTabs />

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex gap-[6px] items-center w-[102px] h-[32px] bg-[#FF3B10] text-xs font-medium text-white rounded-md justify-center"
            onClick={() => {
              setShowWidgetsModal(true);
            }}
          >
            <AddWidget />
            Add Widget
          </button>
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

      <ModalContainer
        open={showWidgetsModal}
        handleClose={() => {
          setShowWidgetsModal(false);
        }}
        className="h-full p-0 rounded-2xl"
        title="Add New Widget"
        noHeader
      >
        <QuickWidgets
          handleBack={() => {
            setShowWidgetsModal(false);
          }}
        />
      </ModalContainer>
    </Fragment>
  );
}
