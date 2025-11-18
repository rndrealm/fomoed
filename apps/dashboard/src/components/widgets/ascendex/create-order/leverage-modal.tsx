import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TriangleDangerIcon } from "@/components/icons/icon2";

interface IProps {
  leverage: number;
  updateLeverage: (value: number) => void;
  isLoading: boolean;
  maxLeverage: number;
}

const presetLeverageOptions = [
  { id: 1, value: 1 },
  { id: 2, value: 2 },
  { id: 3, value: 5 },
  { id: 4, value: 10 },
  { id: 5, value: 20 },
  { id: 6, value: 50 },
];

const LeverageModal = (props: IProps) => {
  const { leverage, updateLeverage, isLoading, maxLeverage } = props;
  const [customLeverage, setCustomLeverage] = useState<string>(leverage.toString());
  const [errorText, setErrorText] = useState("");

  const handleCustomLeverageChange = (value: string) => {
    setCustomLeverage(value);

    if (value === "") {
      setErrorText("");
      return;
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue) || numValue <= 0) {
      setErrorText("Leverage must be greater than 0");
    } else if (numValue > maxLeverage) {
      setErrorText("Maximum leverage reached, there’s a high chance of liquidation if you proceed with it.");
    } else {
      setErrorText("");
    }
  };

  const handleApply = () => {
    if (customLeverage) {
      const numValue = parseFloat(customLeverage);
      if (!isNaN(numValue) && numValue > 0 && numValue <= 100) {
        updateLeverage(numValue);
      }
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1">
        <div className="hidden pb-4">
          <h3 className="text-xs font-normal mb-3 text-[#A6AEB2]">Quick Select</h3>
          <div className="grid grid-cols-3  gap-2">
            {presetLeverageOptions.map((option) => (
              <button
                onClick={() => {
                  updateLeverage(option.value);
                  setCustomLeverage("");
                  setErrorText("");
                }}
                type="button"
                key={option.id}
                className={cn(
                  "flex h-10 cursor-pointer items-center justify-center rounded-[8px] bg-[#1A1A1A] font-medium text-[#AFAFAF] transition text-sm hover:bg-[#252525]",
                  {
                    "border-2 border-[#7637BA] text-white bg-[#7637BA]/10":
                      option.value === leverage && !customLeverage,
                  },
                )}
              >
                {option.value}x
              </button>
            ))}
          </div>
        </div>

        <div className="pb-4 pt-8">
          <p className="text-grey-300 font-medium text-xs">
            Set the maximum leverage — the difference between expected and actual execution price — you&apos;re willing
            to accept. If the slippage exceeds this limit, the trade will fail. This setting converts market orders into
            limit IOC orders.
          </p>
        </div>

        <div className="">
          <div className="relative">
            <input
              type="number"
              className={cn(
                "h-12 w-full rounded-[8px] border border-[#1F1F1F] bg-[#202127] px-3 pr-8 text-sm text-white placeholder:text-[#5F5F5F] focus:outline-none focus:border-[#f4f4f4]",
                {
                  "border-[#FFC26D] focus:border-[#FFC26D]": errorText,
                },
              )}
              placeholder="Enter custom leverage"
              value={customLeverage}
              onChange={(e) => handleCustomLeverageChange(e.target.value)}
              min="1"
              max="100"
              step="0.1"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white">%</span>
          </div>
          {errorText && (
            <div className="flex items-start pt-4 gap-1">
              <TriangleDangerIcon />
              <p className="text-xs text-[#FFC26D] ">{errorText}</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 pt-8">
        <Button
          onClick={handleApply}
          disabled={!!errorText}
          className="flex-1 bg-[#171717]  text-white font-medium text-sm h-11"
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          disabled={!!errorText}
          isLoading={isLoading}
          className="flex-1 bg-[#E7E7E7] hover:bg-[#E7E7E7]  text-[#010101] font-medium text-sm h-11"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default LeverageModal;
