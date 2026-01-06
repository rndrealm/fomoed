import React from "react";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface ITokenTagProps {
  isSpot?: boolean;
  maxLeverage?: number;
}

export const TokenTag = memo(function TokenTag(props: ITokenTagProps) {
  const { isSpot = false, maxLeverage } = props;
  return (
    <div
      className={cn("px-1 h-[16px] bg-[#151517] rounded-sm flex items-center justify-center", isSpot && "bg-[#2E241F]")}
    >
      <p className={cn("text-[10px] tracking-[-0.2%] leading-[1.0] text-[#00AF58]", isSpot && "text-[#C97038]")}>
        {isSpot ? "SPOT" : `${maxLeverage}X`}
      </p>
    </div>
  );
});
