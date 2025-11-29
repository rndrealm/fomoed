"use client";
import React from "react";
import { Crown } from "lucide-react";

interface InitialScreenProps {
  onTradeNowClick: () => void;
}

export default function InitialScreen(props: InitialScreenProps) {
  const { onTradeNowClick } = props;

  return (
    <div className="relative flex h-full w-full justify-center items-center bg-black rounded-2xl">
      <div className="absolute h-[50px] top-[-20px] bottom-0 left-0 right-0 cursor-grab" />

      <div className="absolute top-[10px] left-1/2 -translate-x-1/2 flex justify-center cursor-grab z-20">
        <div className="h-[5px] w-[36px] rounded-[2px] bg-[#444]" />
      </div>

      <button
        onClick={onTradeNowClick}
        className="flex items-center justify-center gap-[5.71px] 
                   px-[17.14px] py-[5.71px] 
                   rounded-[8.57px] 
                   text-white text-[16px] font-semibold
                   bg-[#FF6600]
                   shadow-[inset_1.43px_1.43px_2.86px_rgba(255,182,80,0.85),inset_-1.43px_-1.43px_2.86px_rgba(255,182,80,0.85)]
                   transition-all duration-200 
                   hover:brightness-110 h-[40px]"
      >
        <Crown className="w-5 h-5" stroke="#FCBB0F" fill="#FCBB0F" />
        Trade Now
      </button>
    </div>
  );
}
