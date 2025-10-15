import React from "react";
import { RenderIf } from "../shared";

interface IProps {
  label?: string;
  checked?: boolean;
}

export default function Checkbox(props: IProps) {
  const { label, checked } = props;

  return (
    <button type="button">
      <div className="flex gap-1 items-center">
        <div className="w-[16px] h-[16px] rounded-xs border border-[#A6AEB2] opacity-[0.16]">
          <RenderIf condition={!!checked}>
            <div className="w-full h-full bg-[#A6AEB2] rounded-xs" />
          </RenderIf>
        </div>

        <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">{label}</p>
      </div>
    </button>
  );
}
