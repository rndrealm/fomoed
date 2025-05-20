"use client";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import React, { useState } from "react";
import CignalsChartComp from "./cignals-chart";
import WidgetHeader from "../shared/widget-header";
import { cn } from "@/lib/utils";
import PremiumOverlay from "../shared/premium-overlay";
import { Grip } from "lucide-react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";

interface IProps {
  widget: LayoutType["widgets"][0];
}

const CignalsWidget = (props: IProps) => {
  const { widget } = props;
  return (
    <div className="bg-[#080808] border border-[#1b1b1b] rounded-2xl px-6 py-3 flex flex-col gap-4 h-full">
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="grid items-center w-full grid-cols-3">
          <WidgetHeader widget={widget} />
        </div>
        <CignalsChartComp widget={widget} />
      </div>
    </div>
  );
};

export default CignalsWidget;
