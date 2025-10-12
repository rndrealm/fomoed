import { FullScreenV2 } from "@/components/icons/icons";
import { cn } from "@/lib/utils";
import React from "react";

const FullScreenButtonV2 = ({
  toggleFullscreen,
  isControlsVisible = true,
}: {
  toggleFullscreen: () => void;
  isControlsVisible?: boolean;
}) => {
  return (
    <div
      className={cn(
        "absolute bg-[#393939] right-[16px] bottom-[18px] z-[9] h-[28px] w-[28px] rounded-[6px] border border-[#1c1c1c]",
        { "opacity-0": !isControlsVisible, "opacity-100": isControlsVisible },
      )}
    >
      <button className="flex h-full w-full items-center justify-center" onClick={toggleFullscreen}>
        <FullScreenV2 fill="#fff" />
      </button>
    </div>
  );
};

export default FullScreenButtonV2;
