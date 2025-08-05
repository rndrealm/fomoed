import React from "react";
import { cn } from "@/lib/utils";

interface ILinkPopup {
  label: string;
  className?: string;
  beta?: boolean;
  comingSoon?: boolean;
}

const LinkPopup: React.FC<ILinkPopup> = ({
  label,
  className,
  beta,
  comingSoon,
}) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-1/2 left-[42px] z-50 translate-y-[-50%] items-center justify-center rounded-[10px] border-[1px] border-[#262626] bg-[#0A0A0A] px-3 py-1.5 shadow-[0px_1px_2px_0px_#0000000D]",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <h2 className="font-inter text-xs font-normal text-nowrap text-[#FAFAFA]">
          {label}
        </h2>

        {comingSoon && (
          <div className="rounded-[8px] border-[1px] border-[#3A2C4F] bg-[#2C233A] px-2 py-1">
            <h3 className="text-xs font-normal text-nowrap text-[#C1A8FF]">
              Coming Soon
            </h3>
          </div>
        )}

        {beta && (
          <div className="rounded-[8px] border-[1px] border-[#2C4F3A] bg-[#233A2C] px-2 py-1">
            <h3 className="text-xs font-normal text-nowrap text-[#A8FFC1]">
              BETA
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkPopup;
