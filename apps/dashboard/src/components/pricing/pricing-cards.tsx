"use client";

import React, { ReactNode, useState } from "react";
import BasicPlanCard from "./cards/basicPlan-card";
import ProPlanCard from "./cards/proPlan-card";
import PlusPlanCard from "./cards/plusPlan-card";
import PricingSwitch from "./pricing-switch";

type Feature = {
  icon: ReactNode;
  content: string;
};

export type PricingCard = {
  title: string;
  price: string[];
  description: string;
  features: Feature[];
  buttonConent?: string;
  switchActive?: boolean;
};

type PricingCardsContent = {
  prcingCardsConent: PricingCard[];
};

const PricingCards = ({ prcingCardsConent }: PricingCardsContent) => {
  const basicPlanCardContent = prcingCardsConent.find(
    (item) => item.title === "Basic",
  ) as PricingCard;
  const proPlanCardContent = prcingCardsConent.find(
    (item) => item.title === "Pro",
  ) as PricingCard;
  const plusPlanCardContent = prcingCardsConent.find(
    (item) => item.title === "Voyager",
  ) as PricingCard;

  const [switchActive, setSwitchActive] = useState<boolean>(false);
  // console.log(switchActive);

  return (
    <>
      <div className="">
        <PricingSwitch
          label={["Monthly", "Yearly"]}
          name="period"
          labelClassName="text-[#A5A5A5] text-xs"
          setSwitchActive={setSwitchActive}
        />
      </div>

      <section className="relative mt-[1rem] sm:mt-[2rem] flex justify-center items-center">
        <div
          style={{ transformOrigin: "top center" }}
          className="scale-100 lg:scale-85 xl:scale-100  flex flex-col lg:flex-row gap-20 lg:gap-5"
        >
          <BasicPlanCard {...basicPlanCardContent} />
          <ProPlanCard {...proPlanCardContent} switchActive={switchActive} />
          <PlusPlanCard {...plusPlanCardContent} switchActive={switchActive} />
        </div>
      </section>
    </>
  );
};

export default PricingCards;
