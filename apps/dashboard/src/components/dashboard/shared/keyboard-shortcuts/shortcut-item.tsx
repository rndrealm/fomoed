import React, { forwardRef, ReactNode } from "react";
import {
  AddNewWidget,
  Minus,
  SignOut,
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
  addNewWidget: {
    icon: AddNewWidget,
  },
  removeOne: {
    icon: Minus,
  },
  signOut: {
    icon: SignOut,
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
    <div className={cn("flex w-full rounded-sm")}>
      <div className="flex flex-1 items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1">
          <div className="flex h-[20px] w-[20px] items-center justify-center">{iconsMap[icon].icon()}</div>
          <p className="text-[13px] leading-[18px] font-semibold text-white">{label}</p>
        </div>

        <div className="flex items-center gap-1">
          {shortcutKeys.map((item, index) => {
            return <ShortcutKey key={index} letter={item} isKey={item !== "then"} />;
          })}
        </div>
      </div>
    </div>
  );
};
