import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import dashboard from "@/lib/assets/dashboard";
import Image from "next/image";
import React from "react";

interface IProps {
  content: string;
}

const DexTooltip = (props: IProps) => {
  const { content } = props;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button>
          <Image src={dashboard.info} alt="Info icon" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="bg-[#101010]">
        <p className="text-[#afafaf] text-xs font-semibold leading-[1.25]">
          {content}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

export default DexTooltip;
