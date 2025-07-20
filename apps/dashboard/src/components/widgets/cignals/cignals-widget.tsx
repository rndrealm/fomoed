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
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-[#1b1b1b] bg-[#090909] px-6 py-3">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="grid w-full grid-cols-3 items-center">
          <WidgetHeader widget={widget} />
        </div>
        <CignalsChartComp widget={widget} />
      </div>
    </div>
  );
};

export default CignalsWidget;
