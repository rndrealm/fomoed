import React from "react";
import { cn } from "@/lib/utils";

interface ILinkPopup {
  label: string;
  className?: string;
  beta?: boolean;
  alpha?: boolean;
  comingSoon?: boolean;
}

interface IBadge {
  text: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
}

const Badge: React.FC<IBadge> = ({
  text,
  borderColor,
  backgroundColor,
  textColor,
}) => (
  <div
    className={cn(
      "rounded-[8px] border-[1px] px-2 py-1",
      borderColor,
      backgroundColor,
    )}
  >
    <h3 className={cn("text-xs font-normal text-nowrap", textColor)}>{text}</h3>
  </div>
);

const LinkPopup: React.FC<ILinkPopup> = ({
  label,
  className,
  beta,
  alpha,
  comingSoon,
}) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-1/2 left-[42px] z-50 translate-y-[-50%] items-center justify-center rounded-[12px] border-[1px] border-[#262626] bg-[#0A0A0A] px-2 py-1.5 shadow-[0px_1px_2px_0px_#0000000D]",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <h2 className="font-inter text-xs font-normal text-nowrap text-[#FAFAFA]">
          {label}
        </h2>

        {comingSoon && (
          <Badge
            text="Coming Soon"
            borderColor="border-[#3A2C4F]"
            backgroundColor="bg-[#2C233A]"
            textColor="text-[#C1A8FF]"
          />
        )}

        {beta && (
          <Badge
            text="BETA"
            borderColor="border-[#2C4F3A]"
            backgroundColor="bg-[#233A2C]"
            textColor="text-[#A8FFC1]"
          />
        )}

        {alpha && (
          <Badge
            text="ALPHA"
            borderColor="border-[#4F3A2C]"
            backgroundColor="bg-[#3A2C23]"
            textColor="text-[#FFC1A8]"
          />
        )}
      </div>
    </div>
  );
};

export default LinkPopup;
