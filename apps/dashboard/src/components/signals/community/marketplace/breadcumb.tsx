import React from "react";
import CaretDown from "@/components/icons/CaretDown";
import { AppRoutes } from "@/lib/routes";
import Link from "next/link";

export function Breadcumb() {
  return (
    <div className="w-full flex items-center gap-2">
      <Link
        href={AppRoutes.signals.path}
        className="text-[#737373] text-sm leading-[20px]"
      >
        Smart Signals
      </Link>
      <div className="w-[20px] h-[20px] flex items-center justify-center rotate-270">
        <CaretDown stroke="#737373" />
      </div>
      <Link href={"#"} className="text-[#737373] text-sm leading-[20px]">
        Community
      </Link>
      <div className="w-[20px] h-[20px] flex items-center justify-center rotate-270">
        <CaretDown stroke="#737373" />
      </div>
      <Link href={"#"} className="text-white text-sm leading-[20px]">
        Marketplace
      </Link>
    </div>
  );
}
