import { formatNumber } from "@/lib/utils";
import React from "react";

interface IProps {
  inputValue: string;
  updateInputValue: (value: string) => void;
}

const AmountInput = (props: IProps) => {
  const { inputValue, updateInputValue } = props;
  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        placeholder="0.00"
        value={inputValue}
        onChange={(e) => {
          updateInputValue(e.target.value);
        }}
        className="max-w-[10rem] p-1 text-xl font-bold text-white outline-none placeholder:text-white"
      />
    </div>
  );
};

export default AmountInput;
