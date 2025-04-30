import React, { ReactNode } from "react";
import { Drag } from "../icons/icons";

interface IProps {
  children?: ReactNode;
  layoutKey?: string;
}

export function WidgetWrapper(props: IProps) {
  const { children, layoutKey = "" } = props;

  return (
    <div className="bg-[#080808] border border-[#1b1b1b] rounded-2xl overflow-hidden px-6 py-3 flex flex-col gap-4">
      <div className="flex justify-center">
        <button type="button" className="cursor-grab">
          <Drag />
        </button>
      </div>
      <div className="h-[300px] bg-[gray]">{children}</div>
    </div>
  );
}
