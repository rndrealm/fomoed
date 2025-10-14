import React from "react";
import { WidgetWrapper } from "../shared"; 
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { cn } from "@/lib/utils";

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function Ascendex(props: IProps) {
  const { widget } = props;

  return (
    <WidgetWrapper
      widget={widget}
      isAscendex={true} 
      title="Ascendex" 
      className="justify-between gap-3"
    >
      <div className={cn("flex h-full w-full flex-1 flex-col overflow-hidden")}>
        <p className="text-white">HELLO FROM ASCENDEX</p>
      </div>
    </WidgetWrapper>
  );
}