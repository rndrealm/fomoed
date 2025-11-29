import { TextInput } from "@/components/auth";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

interface IProps {
  toggleModal: () => void;
  onConfirm: () => void;
}

const DepositModal = (props: IProps) => {
  const { toggleModal, onConfirm } = props;
  const [value, setValue] = useState("");
  const endAuth = () => {
    toggleModal();
    onConfirm();
  };

  return (
    <div>
      <h1 className="text-center text-white font-medium text-lg pt-5 pb-9">Deposit USDC</h1>
      <p className="text-[#B0B0B0] font-medium  text-xs">
        Before you can connect, you need to deposit USDC to your hyper liquid wallet.
      </p>

      <div className="pt-4">
        <TextInput
          type="number"
          className="h-12 w-full rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] px-2 pr-4 text-sm text-white placeholder:text-[#5F5F5F] focus:outline-none focus:border-[#f4f4f4]"
          placeholder="0"
          value={value}
          onChange={(e) => setValue((e.target as HTMLInputElement).value)}
          min="1"
          // max={maxValue}
          step="0.1"
          rightPlaceholder="USDC"
          rightPlaceholderClassName="text-sm top-[28%] text-[#6D6D6D]"
          disableFormikError
        />
        <div className="pt-2 text-xs flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="text-[#B0B0B0] ">USDC Balance </p>
            <p className="text-white font-medium ">346 USDC</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#B0B0B0] ">Min. Deposit </p>
            <p className="text-white font-medium ">5 USDC</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-12">
        <Button
          className="flex-1 bg-[#171717] hover:opacity-90 border-[#1F1F1F] border  text-white font-medium text-sm h-11"
          onClick={endAuth}
        >
          Skip
        </Button>
        <Button
          className="flex-1 bg-[#51D2C1] hover:opacity-90 hover:bg-[#51D2C1]  text-[#010101] font-medium text-sm h-11"
          onClick={endAuth}
        >
          Deposit USDC
        </Button>
      </div>
    </div>
  );
};

export default DepositModal;
