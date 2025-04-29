import React from "react";
import { Drag } from "../icons/icons";

export function WidgetWrapper() {
  return (
    <div className="bg-[#080808] border border-[#1b1b1b] rounded-2xl overflow-hidden px-6 py-3 flex flex-col gap-4">
      <div className="flex justify-center">
        <button type="button" className="cursor-grab">
          <Drag />
        </button>
      </div>
      <div className="h-[300px] bg-[gray]"></div>
    </div>
  );
}
