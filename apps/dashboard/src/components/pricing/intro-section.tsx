import React from "react";
import ChevronRight from "@/components/icons/ChevronRight";

const IntroSection = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative p-[1px] overflow-hidden rounded-lg">
        <div className="gradient_border" />
        <div className="relative flex flex-row justify-between items-center gap-1 pl-4 pr-2.5 py-[5px] bg-gradient-100 rounded-lg">
          <p className="text-[#B9B9B9] text-[14px] sm:text-[15px] font-semibold leading-[1.55]">Plans</p>
          <ChevronRight height="20" />
        </div>
      </div>
      <h1 className="text-[1.5rem] sm:text-[2rem] font-medium pt-4 pb-2"> Get your free trial to Unlock More</h1>
      <h3 className="text-[0.925rem] sm:text-base font-medium text-[#B9B9B9]">
        Get <span className="font-semibold text-white">Fomoed Pro</span> to unlock more tools.
      </h3>
    </div>
  );
};

export default IntroSection;
