import { Accuracy, RatingStar } from "@/components/icons/icons";
import React from "react";

export function Pricing() {
  return (
    <div className="flex gap-4 w-full">
      <div className="flex flex-col flex-1 gap-4 py-4 px-2 bg-[#1A1B18EB] max-w-[263px] w-full">
        <div className="flex flex-col gap-2">
          <p className="text-white text-sm leading-[1.35] tracking-[-0.4%]">
            Noah Shiffman’s Liquidity threshold Indicator
          </p>

          <div className="flex gap-1">
            <div className="p-1 rounded-md bg-[#363636]">
              <p className="text-[#F5F5F5] text-[8px] leading-[1.35] tracking-[-0.4%] text-uppercase font-medium">
                LIQUIDITY THRESHOLD
              </p>
            </div>

            <div className="p-1 rounded-md bg-[#363636]">
              <p className="text-[#F5F5F5] text-[8px] leading-[1.35] tracking-[-0.4%] text-uppercase font-medium">
                LIQUIDITY HEAT MAP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-white text-[10px] leading-[1.35] tracking-[-0.4%] font-medium">
              5 STARS
            </p>

            <div className="flex items-center">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="w-[14px] h-[14px] flex items-center justify-center"
                  >
                    <RatingStar />
                  </div>
                ))}
            </div>

            <p className="text-white text-[10px] leading-[1.35] tracking-[-0.4%] font-medium">
              1.8K Ratings
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="h-[24px] px-1 w-full text-left rounded-sm bg-[#2E2F2C]"
          >
            <div className="flex items-center gap-1">
              <div className="w-[8px] h-[8px] rounded-full border border-[#434343]"></div>
              <p className="text-white text-sm leading-[1.35] tracking-[-0.4%] font-medium">
                $4.99
              </p>
            </div>
          </button>

          <button
            type="button"
            className="h-[24px] px-1 w-full text-left rounded-sm"
          >
            <div className="flex items-center gap-1">
              <div className="w-[8px] h-[8px] rounded-full border border-[#434343]"></div>
              <p className="text-white text-sm leading-[1.35] tracking-[-0.4%] font-medium">
                $49.99
              </p>
            </div>
          </button>
        </div>

        <button
          type="button"
          className="h-[32px] bg-white rounded-sm px-3 w-full"
        >
          <p className="text-[#0D0D0D] text-sm leading-[1.35] tracking-[-0.4%]">
            Add to Cart
          </p>
        </button>
      </div>

      <div className="py-3 max-w-[200px] w-full flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-[16px] h-[16px] flex items-center justify-center ">
            <Accuracy />
          </div>
          <p className="text-[#D4D4D4] text-xs leading-[1.35] tracking-[-0.4%]">
            Accuracy - <span className="text-[#399F57]">75%</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-[16px] h-[16px] flex items-center justify-center ">
            <Accuracy />
          </div>
          <p className="text-[#D4D4D4] text-xs leading-[1.35] tracking-[-0.4%]">
            Signal Sensitivity - <span className="text-[#399F57]">75%</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-[16px] h-[16px] flex items-center justify-center ">
            <Accuracy />
          </div>
          <p className="text-[#D4D4D4] text-xs leading-[1.35] tracking-[-0.4%]">
            Average move from signal trigger -{" "}
            <span className="text-[#E4BD18]">34%</span>
          </p>
        </div>
      </div>
    </div>
  );
}
