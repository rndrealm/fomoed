import React, { forwardRef, ReactNode } from "react";
import {
  SpotlightAdd,
  SpotlightClear,
  SpotlightRenameTab,
} from "@/components/icons/icons";
import { ShortcutKey } from "./shortcut-key";
import { cn } from "@/lib/utils";

const iconsMap = {
  rename: {
    icon: SpotlightRenameTab,
  },
  clear: {
    icon: SpotlightClear,
  },
  add: {
    icon: SpotlightAdd,
  },
};

export type IShortcutIcon = keyof typeof iconsMap;

interface IProps {
  label: string;
  shortcutKeys?: string[];
  icon: IShortcutIcon;
}

export const ShortcutItem = (props: IProps) => {
  const { icon = "rename", label, shortcutKeys = [] } = props;

  return (
    <div className={cn("w-full flex rounded-sm")}>
      <div className="flex justify-between flex-1 px-4 py-3 items-center">
        <div className="flex gap-1 items-center">
          <div className="">{iconsMap[icon].icon()}</div>
          <p className="text-[13px] font-semibold leading-[18px] text-white">
            {label}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {shortcutKeys.map((item, index) => {
            return <ShortcutKey key={index} letter={item} />;
          })}
        </div>
      </div>
    </div>
  );
};
