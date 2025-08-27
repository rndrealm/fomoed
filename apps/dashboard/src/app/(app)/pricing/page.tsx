"use client";

import TrendingIcon from "@/components/icons/TrendingIcon";
import PricingCards, { PricingCard } from "@/components/pricing/pricing-cards";
import React, { useMemo } from "react";
import IntroSection from "@/components/pricing/intro-section";
import { DynamicPlanDataMap } from "@/lib/plans/plans.types";
import { usePlans } from "@/hooks/usePlans";
import useSubscription, {
  getSubscriptionState,
  subscriptionStateToConfig,
} from "@/hooks/subscription";
import type { PriceLookupKey } from "@/lib/plans/plans.types";
import type { UserSubscriptionsResponseData } from "../../api/subscriptions/route";
import { BellIcon, Grid2X2Icon } from "lucide-react";
import { WidgetDashboardIcon } from "@/components/icons/icons";

// Prices that are shown for the individual plans before the prices are dynamically loaded
const staticPrices = {
  pro: ["$29.99", "$287.90"],
  plus: ["$9.99", "$95.90"],
};

function getPricingCardsContent(
  dynamicPlanDataMap: DynamicPlanDataMap | null,
  userSubscriptionData?: UserSubscriptionsResponseData,
) {
  const getDescription = (monthly: any, yearly: any) => `${monthly}/month or ${yearly}/year`;

  const getPriceObj = (plan: "pro" | "plus") => {
    const na = "N/A";

    if (!dynamicPlanDataMap) {
      const staticPlanPrices = staticPrices[plan];

      return {
        prices: staticPlanPrices,
        description: getDescription(staticPlanPrices[0], staticPlanPrices[1]),
      };
    }

    const priceUsdMonthly = dynamicPlanDataMap[(plan + "_monthly") as PriceLookupKey]?.price || na;
    const priceUsdYearly = dynamicPlanDataMap[(plan + "_yearly") as PriceLookupKey]?.price || na;

    return {
      prices: [priceUsdMonthly, priceUsdYearly],
      description: getDescription(priceUsdMonthly, priceUsdYearly),
    };
  };

  const plusPriceObj = getPriceObj("plus");
  const proPriceObj = getPriceObj("pro");

  const defaultUserSubscriptionData: UserSubscriptionsResponseData = {
    activePlan: "basic",
    nextPeriodPlan: "basic",
    hasTrialActive: false,
    hasTrialAvailable: true,
    subscriptions: [],
    cancelsIn: null,
    renewsForUsd: null,
    renewsIn: null,
    trialEndsIn: null,
  };

  const { hasTrialAvailable } = userSubscriptionData || defaultUserSubscriptionData;

  const subscriptionState = getSubscriptionState(userSubscriptionData);
  const pricingPageConfig = subscriptionStateToConfig(subscriptionState, hasTrialAvailable);

  const pricingCardsContent: PricingCard[] = [
    {
      title: "Basic",
      prices: ["Free", "Free"],
      description: "$0/month & $0/year",
      features: [
        { icon: <WidgetDashboardIcon color="white" size={17} />, content: "Access to essential widgets" },
        { icon: <TrendingIcon />, content: "Access to BTC and ETH data" },
      ],
      buttonColorProminent: false,
    },
    {
      title: "Pro",
      prices: proPriceObj.prices,
      description: proPriceObj.description,
      features: [
        { icon: <WidgetDashboardIcon color="white" size={17} />, content: "Access to all widgets" },
        {
          icon: <TrendingIcon />,
          content: "Access to 44+ crypto assets",
        },
        {
          icon: <BellIcon size={15} />,
          content: "Access to Smart Signals",
        },
        {
          icon: <Grid2X2Icon size={15} />,
          content: "Up to 10 saved dashboard layouts",
        },
      ],
      buttonConent: pricingPageConfig.proBtnContent,
      switchActive: true,
      buttonColorProminent: pricingPageConfig.proBtnColorProminent,
      buttonAction: pricingPageConfig.proBtnAction,
    },
    {
      title: "Plus",
      prices: plusPriceObj.prices,
      description: plusPriceObj.description,
      features: [
        // { icon: <TimeIcon />, content: "Access to daily data" },
        // { icon: <TradingBlocksIcon />, content: "Access to all time Frames" },
        { icon: <WidgetDashboardIcon color="white" size={17} />, content: "Access to all widgets" },
        {
          icon: <TrendingIcon />,
          content: "Access to 44+ crypto assets",
        },
        {
          icon: <Grid2X2Icon size={15} />,
          content: "Up to 2 saved dashboard layouts",
        },
      ],
      buttonConent: pricingPageConfig.plusBtnContent,
      switchActive: true,
      buttonColorProminent: false,
      buttonAction: pricingPageConfig.plusBtnAction,
    },
  ];

  return pricingCardsContent;
}
const Pricing = () => {
  // TODO add some loading animation
  const { data: plans, isLoading, isError } = usePlans();
  const { userSubscriptionQueryData } = useSubscription();

  const pricingCardsContent = useMemo(() => {
    return getPricingCardsContent(plans?.data || null, userSubscriptionQueryData);
  }, [plans?.data, userSubscriptionQueryData]);

  console.log("Plans data:", plans);
  console.log({ userSubscriptionQueryData });

  return (
    <main className="h-screen w-full relative bg-[#000] text-white grid place-items-center overflow-y-auto overflow-x-hidden">
      <div className="px-6 h-full flex flex-col items-center justify-center gap-y-4 lg:gap-y-[40px] py-12">
        <IntroSection />

        <PricingCards pricingCardsContent={pricingCardsContent} />

        <h2 className="mt-4 text-xs text-[#A5A5A5]">
          Subscribe for a yearly plan to get{" "}
          <span className="font-bold bg-gradient-pricing-number bg-clip-text text-transparent">20%</span> off
        </h2>

        {/* <Questions /> */}
      </div>
    </main>
  );
};

export default Pricing;
