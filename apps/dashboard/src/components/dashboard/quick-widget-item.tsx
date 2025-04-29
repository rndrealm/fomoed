import React from "react";

export function QuickWidgetItem() {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="aspect-[1315/1000] bg-[#000] rounded-lg border border-[#121212]"></div>
      <div className="flex">
        <div className="px-2 py-1 bg-[#141414] rounded-sm">
          <p className="text-xs leading-[1.35] font-medium text-white">
            Liquidation Heat Map
          </p>
        </div>
      </div>
    </div>
  );
}
