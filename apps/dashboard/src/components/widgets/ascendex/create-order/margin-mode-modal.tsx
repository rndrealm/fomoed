import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface IProps {
  isCross: boolean;
  updateMarginMode: (isCross: boolean) => void;
  isLoading: boolean;
  onClose: () => void;
}

const MarginModeModal = (props: IProps) => {
  const { isCross, updateMarginMode, isLoading, onClose } = props;
  const [selectedMode, setSelectedMode] = useState<boolean>(isCross);

  const handleApply = () => {
    updateMarginMode(selectedMode);
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1">
        <div className="pb-4 pt-8">
          <p className="text-grey-300 font-medium text-xs">
            Choose your margin mode. Cross margin uses your entire available balance as collateral, while Isolated
            margin limits the risk to only the margin allocated to this position.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedMode(true)}
            type="button"
            className={cn(
              "flex h-20 cursor-pointer flex-col items-center justify-center rounded-[8px] bg-[#1A1A1A] font-medium text-[#AFAFAF] transition text-sm hover:bg-[#252525]",
              {
                "border-2 border-[#7637BA] text-white bg-[#7637BA]/10": selectedMode === true,
              },
            )}
          >
            <span className="text-base font-semibold">Cross</span>
            <span className="text-xs text-[#A6AEB2] mt-1">Full balance</span>
          </button>

          <button
            onClick={() => setSelectedMode(false)}
            type="button"
            className={cn(
              "flex h-20 cursor-pointer flex-col items-center justify-center rounded-[8px] bg-[#1A1A1A] font-medium text-[#AFAFAF] transition text-sm hover:bg-[#252525]",
              {
                "border-2 border-[#7637BA] text-white bg-[#7637BA]/10": selectedMode === false,
              },
            )}
          >
            <span className="text-base font-semibold">Isolated</span>
            <span className="text-xs text-[#A6AEB2] mt-1">Position only</span>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-8">
        <Button
          onClick={onClose}
          className="flex-1 bg-[#171717] text-white font-medium text-sm h-11"
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          isLoading={isLoading}
          className="flex-1 bg-[#E7E7E7] hover:bg-[#E7E7E7] text-[#010101] font-medium text-sm h-11"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default MarginModeModal;
