import React from "react";
import { LinkIcon, Twitter } from "../icons/icons";

export function Footer() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <p className="text-white font-medium leading-[1.35] text-[15px]">
          JOSHUA JAKE
        </p>

        <div className="h-[25px] w-[1px] bg-[#3C3C3C]"></div>

        <p className="text-[#5F5F5F] font-medium leading-[1.35] text-[15px]">
          MAY 20, 2025
        </p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-white font-medium leading-[1.35] text-[15px]">
          Share Article
        </p>
        <div className="h-[25px] w-[1px] bg-[#3C3C3C]"></div>
        <button type="button">
          <Twitter />
        </button>

        <button type="button">
          <LinkIcon />
        </button>
      </div>
    </div>
  );
}
