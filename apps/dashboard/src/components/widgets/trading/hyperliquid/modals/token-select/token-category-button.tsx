import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ITokenCategoryButtonProps {
  label?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function TokenCategoryButton(props: ITokenCategoryButtonProps) {
  const { label, isActive, onClick } = props;

  return (
    <button type="button" className="px-4 py-1 relative" onClick={onClick}>
      <p className={cn("text-[10px] text-[#B0B0B0] leading-[1.35] relative z-[1]", isActive && "text-white")}>
        {label}
      </p>
      {isActive && (
        <motion.div
          className="absolute top-0 left-0 right-0 bottom-0 bg-[#101012] rounded-sm"
          layoutId="app_trading_catergory"
        ></motion.div>
      )}
    </button>
  );
}
