"use client";

import React, { ReactNode, useState } from "react";
import BasicPlanCard from "./cards/basicPlan-card";
import ProPlanCard from "./cards/proPlan-card";
import PlusPlanCard from "./cards/plusPlan-card";
import PricingSwitch from "./pricing-switch";
import { SubscriptionAction } from "@/hooks/subscription";

type Feature = {
  icon: ReactNode;
  content: string;
};

export type PricingCard = {
  title: string;
  prices: string[];
  description: string;
  features: Feature[];
  buttonConent?: string;
  switchActive?: boolean;
  buttonColorProminent: boolean;
  buttonAction?: SubscriptionAction;
};

type PricingCardsContent = {
  pricingCardsContent: PricingCard[];
};

const PricingCards = ({ pricingCardsContent }: PricingCardsContent) => {
  const basicPlanCardContent = pricingCardsContent.find((item) => item.title === "Basic") as PricingCard;
  const proPlanCardContent = pricingCardsContent.find((item) => item.title === "Pro") as PricingCard;
  const plusPlanCardContent = pricingCardsContent.find((item) => item.title === "Plus") as PricingCard;

  const [switchActive, setSwitchActive] = useState<boolean>(true);
  // console.log(switchActive);

  return (
    <>
      <div className="">
        <PricingSwitch
          label={["Monthly", "Yearly"]}
          name="period"
          checked={switchActive}
          labelClassName="text-[#A5A5A5] text-xs"
          setSwitchActive={setSwitchActive}
        />
      </div>

      <section className="relative mt-[1rem] lg:mt-[3rem] flex justify-center items-center">
        <div className="scale-100 lg:scale-85 xl:scale-100 w-0" style={{ transformOrigin: "top center" }}>
          <div className="flex flex-col lg:flex-row gap-x-5 gap-y-8 min-w-max -translate-x-1/2">
            <BasicPlanCard {...basicPlanCardContent} />

            <div className="pt-8 lg:pt-0">
              <ProPlanCard {...proPlanCardContent} switchActive={switchActive} />
            </div>

            <PlusPlanCard {...plusPlanCardContent} switchActive={switchActive} />
          </div>
        </div>
      </section>
    </>
  );
};

export default PricingCards;
