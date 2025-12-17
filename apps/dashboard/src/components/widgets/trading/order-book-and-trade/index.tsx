"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import OrderBooks from "./orderbooks";
import Trades from "./trades";
import { ThreeDots } from "@/components/icons/icons";
import { EllipsisVertical } from "lucide-react";
import { ac } from "vitest/dist/chunks/reporters.nr4dxCkA.js";

interface ITabButtonProps {
  isActive: boolean;
  label: string;
  onClick?: () => void;
}

function TabButton(props: ITabButtonProps) {
  const { isActive = false, label, onClick } = props;
  return (
    <button type="button" onClick={onClick}>
      <div className="relative px-3 py-1.5">
        <p
          className={cn(
            "text-[#84858C] text-[10px] font-medium leading-[14px] relative z-10",
            isActive && "text-white",
          )}
        >
          {label}
        </p>
        {isActive && (
          <motion.div
            layoutId="app_ascendex_orderbook_tab"
            className="absolute top-0 left-0 w-full h-full bg-[#2B2C32] rounded-sm"
          ></motion.div>
        )}
      </div>
    </button>
  );
}

export default function OrderBookAndTrade() {
  const [activeTab, setActiveTab] = useState<"orderbook" | "trades">("orderbook");

  return (
    <div className="w-[210px] h-full flex flex-col bg-[#121317] rounded-[10px] overflow-hidden">
      <div className="flex items-center justify-center px-3 py-2.5 relative">
        <div className="flex bg-[#222329] rounded-md items-center">
          <TabButton
            isActive={activeTab === "orderbook"}
            label="Order Book"
            onClick={() => setActiveTab("orderbook")}
          />
          <TabButton isActive={activeTab === "trades"} label="Trades" onClick={() => setActiveTab("trades")} />
        </div>

        {/* <button className="absolute right-3 text-white hover:text-gray-300 transition-colors">
          <EllipsisVertical className="w-4 h-4" />
        </button> */}
      </div>

      {/* <div className="flex-1 overflow-hidden">{activeTab === "orderbook" ? <OrderBooks /> : <Trades />}</div> */}

      <div className="flex-1 overflow-hidden flex">
        <div className={cn("flex-1 overflow-hidden", activeTab === "orderbook" ? "block" : "hidden")}>
          <OrderBooks />
        </div>

        <div className={cn("flex-1 overflow-hidden", activeTab === "trades" ? "block" : "hidden")}>
          <Trades />
        </div>
      </div>
    </div>
  );
}
