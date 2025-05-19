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
  const [openOptionModal, setOpenOptionModal] = useState(false);
  const closeModal = () => setOpenOptionModal(false);
  const { widget } = props;
  return (
    <div className="bg-[#080808] border border-[#1b1b1b] rounded-2xl px-6 py-3 flex flex-col gap-4 h-full">
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="grid items-center w-full grid-cols-3">
          <WidgetHeader widget={widget} />
        </div>
        <div
          className={cn(
            "flex flex-col justify-center w-full h-full rounded-sm"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-[0.1rem] py-2 text-base font-semibold">
              <h3 className="text-white ">BTC/USD</h3>
              <p className="text-[#737373]">Volume Footprint Chart</p>
            </div>
            <button
              onClick={() => setOpenOptionModal(true)}
              className="bg-[#121212] p-2 rounded-[6px]"
            >
              <Image src={dashboard.settings} alt="settings icon" />
            </button>
          </div>
          <PremiumOverlay>
            <CignalsChartComp
              modalOpen={openOptionModal}
              onClose={closeModal}
            />
          </PremiumOverlay>
        </div>
      </div>
    </div>
  );
};

export default CignalsWidget;
