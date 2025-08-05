// "use client";

import EntryTradingIcon from "@/components/icons/EntryTradingIcon";
import TimeIcon from "@/components/icons/TimeIcon";
import TradingArrowIcon from "@/components/icons/TradingArrowIcon";
import TradingBlocksIcon from "@/components/icons/TradingBlocksIcon";
import TrendingIcon from "@/components/icons/TrendingIcon";
import PricingCards from "@/components/pricing/pricing-cards";
import Questions from "@/components/pricing/faq-section";
import React from "react";
import IntroSection from "@/components/pricing/intro-section";

const prcingCardsConent = [
  {
    title: "Basic",
    price: ["Free", "Free"],
    description: "0$/month & 0$/year",
    features: [
      { icon: <TimeIcon />, content: "Access to daily data" },
      { icon: <TrendingIcon />, content: "Access to BTC and ETH charts" },
    ],
  },
  {
    title: "Pro",
    price: ["9.99", "90"],
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
    switchActive: true,
  },
  {
    title: "Voyager",
    price: ["4.99", "50"],
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
    switchActive: true,
  },
];

const Pricing = () => {
  return (
    <main className="min-h-screen w-full relative bg-[#000] text-white font-inter flex items-start justify-center pb-8">
      <div className="overflow-hidden px-6 h-full mt-28 sm:mt-[100px] flex flex-col items-center justify-center gap-[40px]">
        <IntroSection />

        <PricingCards prcingCardsConent={prcingCardsConent} />

        <h2 className="mt-4 text-xs text-[#A5A5A5]">
          Subscribe for a yearly plan to get{" "}
          <span className="font-bold bg-gradient-pricing-number bg-clip-text text-transparent">
            10%
          </span>{" "}
          off
        </h2>

        {/* <Questions /> */}
      </div>
    </main>
  );
};

export default Pricing;
