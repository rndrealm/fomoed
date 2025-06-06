import { formatNumber } from "@/lib/utils";
import React from "react";

interface IProps {
  inputValue: string;
  updateInputValue: (value: string) => void;
  setMax: () => void;
}

const AmountInput = (props: IProps) => {
  const { inputValue, updateInputValue, setMax } = props;
  return (
    <div className="flex items-center gap-1 jus">
      <input
        type="text"
        placeholder="0.00"
        value={inputValue}
        onChange={(e) => {
          updateInputValue(e.target.value);
        }}
        className="p-1 text-xs font-medium outline-none max-w-[3rem]"
      />
      <button
        className="flex items-center justify-center w-8 h-5 font-medium text-xxxs bg-[#202020] rounded-[20px]"
        onClick={setMax}
      >
        Max
      </button>
    </div>
  );
};

export default AmountInput;
