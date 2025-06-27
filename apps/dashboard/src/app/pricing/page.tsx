// "use client";

import ChevronRight from "@/components/icons/ChevronRight";
import EntryTradingIcon from "@/components/icons/EntryTradingIcon";
import TimeIcon from "@/components/icons/TimeIcon";
import TradingArrowIcon from "@/components/icons/TradingArrowIcon";
import TradingBlocksIcon from "@/components/icons/TradingBlocksIcon";
import TrendingIcon from "@/components/icons/TrendingIcon";
import PricingCards from "@/components/pricing/pricing-cards";
import React from "react";

const prcingCardsConent = [
  {
    title: "Basic",
    price: "Free",
    description: "0$/month & 0$/year",
    features: [
      { icon: <TimeIcon />, content: "Access to daily data" },
      { icon: <TrendingIcon />, content: "Access to BTC and ETH charts" },
    ],
  },
  {
    title: "Pro",
    price: "$9.99",
    description: "9.99$/month or 90$/year",
    features: [
      { icon: <TradingBlocksIcon />, content: "Access to all time Frames" },
      {
        icon: <TradingArrowIcon />,
        content: "Access to 44+ crypto assets and charts",
      },
      {
        icon: <EntryTradingIcon />,
        content: "Automatic raffe entry for a One on One training with",
      },
    ],
    buttonConent: "Start a free trial",
  },
  {
    title: "Plus",
    price: "$4.99",
    description: "4.99$/month or 50$/year",
    features: [
      { icon: <TimeIcon />, content: "Access to daily data" },
      { icon: <TradingBlocksIcon />, content: "Access to all time Frames" },
      {
        icon: <TrendingIcon />,
        content: "Access to 44+ crypto assets and charts",
      },
    ],
    buttonConent: "Get plus",
  },
];

const Pricing = () => {
  return (
    <main className="min-h-screen w-full relative bg-[#000] text-white font-inter flex items-start justify-center pb-8">
      <div className="overflow-hidden px-6 h-full mt-28 sm:mt-[120px] flex flex-col items-center justify-center gap-[50px]">
        <div className="flex flex-col items-center justify-center">
          <div className="relative p-[1px] overflow-hidden rounded-lg">
            <div className="gradient_border" />
            <div className="relative flex flex-row justify-between items-center gap-1 pl-4 pr-2.5 py-[5px] bg-gradient-100 rounded-lg">
              <p className="text-[#B9B9B9] text-[14px] sm:text-[15px] font-semibold leading-[1.55]">Plans</p>
              <ChevronRight height="20" />
            </div>
          </div>
          <h1 className="text-[1.5rem] sm:text-[2rem] font-medium pt-4 pb-2">
            Get your free trial to Unlock More
          </h1>
          <h3 className="text-[0.925rem] sm:text-base font-medium text-[#B9B9B9]">
            Get <span className="font-semibold text-white">Fomoed Pro</span> to unlock more
            tools.
          </h3>
        </div>

        <PricingCards prcingCardsConent={prcingCardsConent} />

        <h2 className="text-xs text-[#A5A5A5]">
          Subscribe for a yearly plan to get <span className="font-bold bg-gradient-pricing-number bg-clip-text text-transparent">10%</span> off
        </h2>
      </div>

    </main>
  );
};

export default Pricing;
