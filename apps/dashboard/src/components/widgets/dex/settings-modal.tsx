import { DexQuoteResult } from "@/services/queries/dex/types";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import RemoteImage from "../shared/remote-image";
import { cn, removeDecimal } from "@/lib/utils";

interface IProps {
  isOpen: boolean;
  toggle: () => void;
  slippage: {
    value: number;
    custom: boolean;
  };
  updateSlippage: (value: number, custom: boolean) => void;
}

const presetSlippageOptions = [
  { id: 1, value: 0.5, active: true },
  { id: 2, value: 1, active: false },
  { id: 3, value: 3, active: false },
  { id: 4, value: 3, active: false, editable: true },
];

const SettingsModal = (props: IProps) => {
  const { isOpen, toggle, slippage, updateSlippage } = props;
  const [errorText, setErrorText] = useState("");

  return (
    <AnimatePresence>
      {isOpen ? (
        // Dropdown content
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-[#080808] p-3 rounded-[15px] flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="flex items-center justify-between pb-2">
            <h1 className="font-semibold text-mid">Swap Settings</h1>
            <button
              className="bg-[#121212] border border-[#141414] rounded-[6px] w-7 h-7 flex items-center justify-center"
              onClick={() => {
                toggle();
              }}
            >
              <Image src={dashboard.x} alt="Cancel icon" />
            </button>
          </div>
          <div className="bg-[#121212] px-3 py-4 rounded-[16px]">
            <div className="pb-3">
              <h3 className="text-xs font-normal">Slippage Tolerance</h3>

              <div className="flex items-center gap-1 pt-4">
                {presetSlippageOptions.map((option) => {
                  return option.editable ? (
                    <div
                      key={option.id}
                      className="relative flex-1 font-geist-medium text-[0.94rem] text-[#5F5F5F]"
                    >
                      <input
                        type="number"
                        className={cn(
                          "h-8 w-full rounded-[20px] border-1 border-[#1E1E1E] bg-[#080808] px-2 text-xs",
                          {
                            "border border-[#636363]": slippage.custom,
                          }
                        )}
                        placeholder="Custom"
                        value={slippage.custom ? slippage.value : ""}
                        onChange={(e) => {
                          console.log(e);
                          if (parseFloat(e.target.value) > 50) {
                            setErrorText("Slippage cannot be more than 50%");
                          } else if (e.target.value) {
                            setErrorText("");
                            updateSlippage(parseFloat(e.target.value), true);
                          } else {
                            setErrorText("");
                            updateSlippage(0.5, false);
                          }
                        }}
                      />
                      <span className="absolute right-3 top-[27%] text-xs">
                        %
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        updateSlippage(option.value, false);
                      }}
                      type="button"
                      key={option.id}
                      className={cn(
                        "flex h-8 w-13 cursor-pointer items-center justify-center rounded-[20px]  bg-[#202020] font-geist-medium  text-[#AFAFAF] transition text-xs",
                        {
                          "border border-[#636363]":
                            option.value === slippage.value && !slippage.custom,
                        }
                      )}
                    >
                      {option.value}%
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SettingsModal;
