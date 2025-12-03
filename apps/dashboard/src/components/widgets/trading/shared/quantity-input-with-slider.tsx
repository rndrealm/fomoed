"use client";

import React, { memo, useMemo } from "react";
import { InputWithSelect } from "@/components/shared/input-with-select";
import { Slider } from "@/components/ui/slider";
import { TextInput } from "@/components/auth/text-input";
import { SelectOption } from "@/components/ui/app-select";
import { cn } from "@/lib/utils";
import { useTicker } from "../chart/trading-view/hyperliquid/use-ticker";

interface QuantityInputWithSliderProps {
  // Input props
  quantity: string;
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuantityBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  inputClassName?: string;
  inputName?: string;

  // Select props
  selectOptions: SelectOption[];
  selectedOption: string;
  onSelectChange: (value: string) => void;

  // Slider props
  balance: number;
  leverage: number;
  onSliderChange: (percentage: number) => void;
  sliderClassName?: string;

  // Ticker props
  coinName: string;

  // Optional
  disabled?: boolean;
}

/**
 * A memoized component that combines InputWithSelect and Slider with TextInput.
 * Uses useTicker hook internally to get market price for calculations.
 * Memoization limits rerender blast radius to only this component when ticker updates.
 */
const QuantityInputWithSlider = memo(function QuantityInputWithSlider(
  props: QuantityInputWithSliderProps
) {
  const {
    quantity,
    onQuantityChange,
    onQuantityBlur,
    inputClassName,
    inputName = "quantity",
    selectOptions,
    selectedOption,
    onSelectChange,
    balance,
    leverage,
    onSliderChange,
    sliderClassName,
    coinName,
    disabled = false,
  } = props;

  // Use ticker hook to get market price - rerenders isolated to this component
  const { ticker } = useTicker(coinName);
  const marketPrice = useMemo(() => {
    return ticker?.ctx?.midPx ? Number(ticker.ctx.midPx) : 0;
  }, [ticker?.ctx?.midPx]);

  // Calculate multiplier based on selected option
  const multiplier = useMemo(() => {
    return selectedOption === selectOptions[0]?.value ? marketPrice : 1;
  }, [selectedOption, selectOptions, marketPrice]);

  // Calculate slider percentage
  const sliderPercentage = useMemo(() => {
    if (!balance || !quantity) return 0;
    return Math.round(
      Math.min(((Number(quantity) * multiplier) / leverage / balance) * 100, 100)
    );
  }, [balance, quantity, multiplier, leverage]);

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const percentage = value[0];
    onSliderChange(percentage);
  };

  // Handle select change with conversion
  const handleSelectChange = (val: string) => {
    if (val === selectedOption) return;
    onSelectChange(val);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Quantity Input with Select */}
      <div className="flex flex-col gap-1">
        <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">
          Quantity
        </p>

        <div className="flex flex-col">
          <InputWithSelect
            className={cn(
              "h-[24px] w-full border-none outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-sm focus-visible:ring-0 bg-[#222329]",
              inputClassName
            )}
            type="number"
            value={quantity}
            onChange={onQuantityChange}
            onBlur={onQuantityBlur}
            name={inputName}
            placeholder="Quantity"
            rightPlaceholder="USDC"
            selectOptions={selectOptions}
            selectValue={selectedOption}
            onChangeSelect={handleSelectChange}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Slider with Percentage Input */}
      <div className="flex items-center gap-1.5">
        <Slider
          value={[sliderPercentage]}
          onValueChange={handleSliderChange}
          min={0}
          max={100}
          step={1}
          showDots
          className={sliderClassName}
          disabled={disabled}
        />
        <TextInput
          className="h-[1.5rem] !pr-4.5 w-[3rem] border-none outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-sm focus-visible:ring-0 bg-[#222329]"
          value={sliderPercentage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleSliderChange([Number(e.target.value)])
          }
          name="percentage"
          rightPlaceholder="%"
          type="number"
          disabled={disabled}
        />
      </div>
    </div>
  );
});

QuantityInputWithSlider.displayName = "QuantityInputWithSlider";

export { QuantityInputWithSlider };
export type { QuantityInputWithSliderProps };
