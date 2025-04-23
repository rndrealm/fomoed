import ChevronRight from "@/components/icons/ChevronRight";
import PricingCards from "@/components/pricing/pricing-cards";
import React from "react";

const Pricing = () => {
  return (
    <main className="min-h-screen w-full bg-[#000] text-white flex items-center justify-center">
      <div>
        <div className="flex flex-col items-center justify-center">
          <div className="relative p-[0.5px] overflow-hidden rounded-lg">
            <div className="gradient_border" />
            <div className="flex items-center gap-1 bg-gradient-100 w-[5.19rem] h-[2.125rem] justify-center rounded-lg relative">
              <p className="text-[#B9B9B9] text-[15px] font-semibold">Plans</p>
              <ChevronRight height="20" />
            </div>
          </div>
          <h1 className="text-[2rem] font-medium pt-4 pb-2">
            Get your free trial to Unlock More
          </h1>
          <h3 className="text-base font-medium">
            Get <span className="font-semibold">Fomoed Pro</span> to unlock more
            tools.
          </h3>
        </div>
        <PricingCards />
      </div>
    </main>
  );
};

export default Pricing;
