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
        <div className={`h-[20px] rounded-sm border border-[#353535] px-1 ${className}`}>
          <p className="text-xs leading-[16px] tracking-[-0.4%] text-white">{letter}</p>
        </div>
      </RenderIf>
    </Fragment>
  );
}
