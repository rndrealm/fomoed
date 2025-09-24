import { CommandIcon } from "@/components/icons/icons";
import { RenderIf } from "@/components/shared";
import React, { Fragment } from "react";

interface IShortcutKey {
  letter: string;
  className?: string;
  isKey?: boolean;
}

export function ShortcutKey(props: IShortcutKey) {
  const { letter, className = "", isKey = true } = props;

  return (
    <Fragment>
      <RenderIf condition={!isKey}>
        <p className="text-xs leading-[16px] tracking-[-0.4%] text-white">{letter}</p>
      </RenderIf>
      <RenderIf condition={isKey}>
        <div
          className={`flex items-center justify-center px-1 h-[24px] aspect-square rounded-sm border border-[#242424] bg-[#1A1A1A] ${className}`}
        >
          {letter === "Command" ? (
            <CommandIcon fill="#A6AEB2" />
          ) : (
            <p className="text-xs leading-[16px] tracking-[-0.4%] text-[#A6AEB2]">{letter}</p>
          )}
        </div>
      </RenderIf>
    </Fragment>
  );
}
