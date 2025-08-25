import React from "react";
import { PricingCard } from "../pricing-cards";
import PricingSwitch from "../pricing-switch";
import CheckeredLine from "../../icons/CheckeredLine";

const BasisPlanCard = ({
  title,
  prices,
  description,
  features,
}: PricingCard) => {
  return (
    <div className="relative h-fit w-[360px] flex flex-col justify-between gap-1.5">
      <div className="relative overflow-hidden p-[1px] h-full rounded-2xl backdrop-blur-2xl">
        <div className="gradient_border_basicplan" />

        <div
          className="relative z-10 h-full px-6 pt-6 pb-8 bg-gradient-basicplan rounded-2xl
                flex flex-col justify-between items-start gap-6
                "
        >
          <div className="flex flex-col gap-6">
            <h2 className="text-base">{title}</h2>
            <div className="flex flex-col gap-4">
              <h2 className="text-4xl">{prices[0]}</h2>
              <p className="text-base">{description}</p>
            </div>
          </div>

          <div className="relative">
            <CheckeredLine color="#434343" />
          </div>

          <div className="flex flex-col gap-3 mb-4 w-[90%] justify-center items-start">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="p-0.5 ml-[-3.5px]">{feature.icon}</div>

                <p className="text-xs text-[#A5A5A5]">{feature.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasisPlanCard;
