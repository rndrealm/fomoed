import { cn } from "@/lib/utils";
import React from "react";

const Loader = ({ className }: { className?: string }) => {
  return <span className={cn("loader w-[22px] h-[22px]", className)}></span>;
};

export default Loader;
