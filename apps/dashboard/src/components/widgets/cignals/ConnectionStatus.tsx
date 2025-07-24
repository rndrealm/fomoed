import React from "react";
import { cn } from "@/lib/utils";
import { capitalizeFirst } from "@/lib/utils";

export interface ConnectionStatusProps {
  status: "connected" | "connecting" | "disconnected";
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  return (
      <div className="flex items-center gap-1 rounded-[6px] bg-[#1C1C1C] px-2 py-1">
        <div
          className={cn("h-2 w-2 rounded-full", {
            "bg-[#399F57]": status === "connected",
            "bg-[#FFB800]": status === "connecting",
            "bg-[#FF3D3D]": status === "disconnected",
          })}
        />
        <p className="text-xs font-semibold text-[#9B9FA4]">{capitalizeFirst(status)}</p>
      </div>
  );
};

export default ConnectionStatus;
