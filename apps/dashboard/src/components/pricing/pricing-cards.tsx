import React, { ReactNode } from "react";
import BasicPlanCard from "./basicPlan-card";
import ProPlanCard from "./proPlan-card";
import PlusPlanCard from "./plusPlan-card";

type Feature = {
  icon: ReactNode;
  content: string;
};

export type PricingCard = {
  title: string;
  price: string;
  description: string;
  features: Feature[];
  buttonConent?: string;
};

type PricingCardsContent = {
  prcingCardsConent: PricingCard[];
};

const PricingCards = ({ prcingCardsConent }: PricingCardsContent) => {
  const basicPlanCardContent = prcingCardsConent.find(
    (item) => item.title === "Basic"
  ) as PricingCard;
  const proPlanCardContent = prcingCardsConent.find(
    (item) => item.title === "Pro"
  ) as PricingCard;
  const plusPlanCardContent = prcingCardsConent.find(
    (item) => item.title === "Plus"
  ) as PricingCard;

  return (
    <section className="relative mt-[3rem]">
      <div className="flex flex-row gap-5">
        <BasicPlanCard {...basicPlanCardContent} />
        <ProPlanCard {...proPlanCardContent} />
        <PlusPlanCard {...plusPlanCardContent} />
      </div>
    </section>
  );
};

export default PricingCards;
