import React from "react";

export function Overview() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-[10px] leading-[16px] font-medium">Cross- Margin Overview</h3>

        <div className="bg-[#1E2025] rounded-sm w-[22px] h-[16px] flex justify-center items-center">
          <p className="text-white text-[8px] leading-[1.35] font-medium">10x</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Initial Margin</p>

            <p className="text-white text-[8px] font-semibold leading-[10px] tracking-[-0.4%]">0%</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Maintenance Margin</p>

            <p className="text-white text-[8px] font-semibold leading-[10px] tracking-[-0.4%]">0%</p>
          </div>
        </div>

        <div className="border-t border-[#242C30] border-dashed"></div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Equity Total</p>

            <p className="text-white text-[8px] font-semibold leading-[10px] tracking-[-0.4%]">$0.00</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Equity Total</p>

            <p className="text-white text-[8px] font-semibold leading-[10px] tracking-[-0.4%]">$0.00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
