import React from "react";
import { cn } from "@/lib/utils";

interface ILinkPopup {
  label: string;
  className?: string;
}

const LinkPopup: React.FC<ILinkPopup> = ({ label, className }) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-1/2 left-[42px] z-50 translate-y-[-50%] items-center justify-center rounded-[10px] border-[1px] border-[#262626] bg-[#0A0A0A] px-3 py-1.5 shadow-[0px_1px_2px_0px_#0000000D]",
        className
      )}
    >
      <h2 className="font-inter text-xs font-normal text-nowrap text-[#FAFAFA]">{label}</h2>
    </div>
  );
};

export default LinkPopup;
