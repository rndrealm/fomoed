import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";

interface IProps {
  isCross: boolean;
  updateMarginMode: (isCross: boolean) => void;
  isLoading: boolean;
  onClose: () => void;
}

const options = [
  {
    label: "Cross",
    value: true,
    desc: "Your available balance backs all open positions, helping reduce liquidation risk but putting more of your account at stake.",
  },
  {
    label: "Isolated",
    value: false,
    desc: "Only the margin you assign to this position is at risk, so losses on this trade won’t drain the rest of your balance.",
  },
];

const MarginModeModal = (props: IProps) => {
  const { isCross, updateMarginMode, isLoading, onClose } = props;
  const [selectedMode, setSelectedMode] = useState<boolean>(isCross);

  const handleApply = () => {
    updateMarginMode(selectedMode);
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1">
        <div className="flex flex-col gap-4 mt-8">
          {options.map((opt, i) => {
            return (
              <button
                key={i}
                className="bg-[#18181A] border-[0.5px] rounded-[8px] px-4 py-5 border-[#1F1F1F]"
                onClick={() => setSelectedMode(opt.value)}
              >
                <Checkbox
                  labelClassName="font-medium text-xs"
                  className="gap-2"
                  label={opt.label}
                  checked={opt.value === selectedMode}
                />
                <p className="pt-2 text-[#B0B0B0] text-[0.6875rem] text-left">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2 pt-8">
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
