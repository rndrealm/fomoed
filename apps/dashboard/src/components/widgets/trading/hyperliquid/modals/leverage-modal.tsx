import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TriangleDangerIcon } from "@/components/icons/icon2";
import OrderCheckLayout from "../create-order/order-check-layout";
import { TextInput } from "@/components/auth";

interface IProps {
  leverage: number;
  updateLeverage: (value: number) => void;
  isLoading: boolean;
  maxLeverage: number;
  onClose: () => void;
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
  const { leverage, updateLeverage, isLoading, maxLeverage, onClose } = props;
  const [customLeverage, setCustomLeverage] = useState<string>(leverage.toString());
  const [errorText, setErrorText] = useState("");

  const handleCustomLeverageChange = (value: string) => {
    const numValue = parseFloat(value);

    // Don't allow values greater than maxLeverage
    if (!isNaN(numValue) && numValue > maxLeverage) {
      return;
    }

    setCustomLeverage(value);

    if (value === "") {
      setErrorText("");
      return;
    }

    if (isNaN(numValue) || numValue <= 0) {
      setErrorText("Leverage must be greater than 0");
    } else if (numValue > maxLeverage / 2) {
      setErrorText("High leverage detected, there's a high chance of liquidation if you proceed with it.");
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
            Pick how much you want to amplify your position. Higher leverage boosts your upside — and your downside. Set
            the multiplier you’re comfortable with before you enter the trade.
          </p>
        </div>

        <div className="">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Slider
                value={[parseFloat(customLeverage) || 1]}
                onValueChange={(values) => handleCustomLeverageChange(values[0].toString())}
                min={1}
                max={maxLeverage}
                className="w-full"
                step={1}
                showDots
              />
            </div>
            <TextInput
              className="h-12 !pr-1 w-14 border-none outline-none text-[#D7D7D7] !text-sm tracking-[-0.4%] leading-[14px] px-2 rounded-[10px] focus-visible:ring-0 bg-[#222329]"
              value={customLeverage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCustomLeverageChange(e.target.value)}
              name="percentage"
              rightPlaceholder="X"
              rightPlaceholderClassName="text-xs top-[35%]"
              disableFormikError
              type="number"
            />
          </div>

          <div
            className={cn("flex items-start pt-4 gap-1", {
              invisible: !errorText,
            })}
          >
            <div className="mt-0.5">
              <TriangleDangerIcon />
            </div>
            <p className="text-xs text-[#FFC26D] ">{errorText || ""}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-8">
        <Button
          onClick={onClose}
          disabled={!!errorText}
          className="flex-1 bg-[#171717] border border-[#1F1F1F] text-white font-medium text-sm h-11"
        >
          Cancel
        </Button>
        <OrderCheckLayout
          buttonClassName="flex-1 bg-[#E7E7E7]  hover:bg-[#E7E7E7]  text-[#010101] font-medium text-sm h-11 "
          buttonContainerClassName="flex-1"
          buttonWrapperClassName="w-6/12"
          approveClassName="h-11 !text-[0.875rem]"
        >
          <Button
            onClick={handleApply}
            disabled={!!errorText}
            isLoading={isLoading}
            className="flex-1 bg-[#E7E7E7]  hover:bg-[#E7E7E7]  text-[#010101] font-medium text-sm h-11"
          >
            Submit
          </Button>
        </OrderCheckLayout>
      </div>
    </div>
  );
};

export default LeverageModal;
