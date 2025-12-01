"use client";

import React, { useState } from "react";
import { PricingCard } from "../pricing-cards";
import CheckeredLine from "../../icons/CheckeredLine";
import { AnimatePresence, motion } from "motion/react";
import useSubscription from "@/hooks/subscription";
import { PricingCardButton } from "./pricing-card-common";
import { RenderIf } from "@/components/shared";

const PlusPlanCard = ({
  title,
  prices,
  description,
  features,
  buttonConent,
  switchActive,
  buttonColorProminent,
  buttonAction,
}: PricingCard) => {
  const cardBusyKey = "plus";

  const { changeSubscriptionMutation, busyKey, activePlan, nextPeriodPlan } = useSubscription();
  const [isHovered, setIsHovered] = useState(false);

  function handleButtonClick() {
    if (!buttonAction) throw new Error("Button action is not defined");

    changeSubscriptionMutation.mutate({
      action: buttonAction,
      billingPeriod: switchActive ? "yearly" : "monthly",
      plan: "plus",
      busyKey: cardBusyKey,
    });
  }

  const variants = {
    hidden: { y: "-100%", opacity: 0 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      y: "100%",
      opacity: 0,
      transition: { duration: 0.4, ease: "easeIn" },
    },
  };

  return (
    <motion.div
      style={{ willChange: "transform" }}
      className="relative h-fit w-[360px] flex flex-col justify-between items-center gap-1.5"
      animate={{ y: isHovered ? "-24px" : "0" }}
      transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.5 }}
    >
      <div
        className="relative h-full rounded-2xl backdrop-blur-2xl"
        // TODO revert this
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          style={{ transformOrigin: "top center", willChange: "transform" }}
          className="inset-0 z-0 absolute w-full h-full rounded-[18px] bg-gradient-plusplan-hover pt-[9px] pl-4.5"
          animate={{
            scaleX: isHovered ? 1.025 : 1,
            scaleY: isHovered ? 1.109 : 1,
          }}
          transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.5 }}
        >
          <div className="flex flex-row items-center justify-start gap-2.5">
            <h3 className="text-[#022A0F] text-xs cursor-pointer underline mt-0.5 font-semibold">
              <RenderIf condition={nextPeriodPlan === "basic"}>Upgrade to this plan</RenderIf>
              <RenderIf condition={nextPeriodPlan === "plus"}>This plan is active</RenderIf>
              <RenderIf condition={nextPeriodPlan === "pro"}>Switch to this plan</RenderIf>
            </h3>

            <div className="flex items-center justify-between bg-[#022A0F] rounded-[6px] py-1 pl-2.5 pr-3 gap-1.5">
              <StarIcon />
              <h3 className="pointer-events-none text-white uppercase text-[10px] mt-[1px]">new</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ willChange: "transform" }}
          className="relative overflow-hidden p-[1px] h-full rounded-2xl "
          animate={{ y: isHovered ? "44px" : "0" }}
          transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.5 }}
        >
          <div className="gradient_border_plusplan" />

          <div
            className="relative z-10 h-full  px-6 pt-6 pb-4 bg-[#0A0A0A] rounded-2xl
                        flex flex-col justify-between items-start gap-5
                    "
          >
            <div className="flex flex-col gap-6">
              <h2 className="text-base">{title}</h2>

              <div className="absolute top-5 right-4.5 pointer-events-none">
                <div className="relative p-[1px] overflow-hidden rounded-tr-[12px]">
                  <div className="gradient_border" />
                  <div className="relative flex flex-row justify-between items-center gap-1 px-2.5 py-1.5 bg-[#070707] rounded-tr-[12px]">
                    <p className="text-white text-[13px] font-normal">Most Popular</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={switchActive ? prices[1] : prices[0]}
                      variants={variants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="text-[2rem]! font-semibold "
                    >
                      {switchActive ? prices[1] : prices[0]}
                    </motion.h2>
                  </AnimatePresence>
                </div>

                <p className="text-base">{description}</p>
              </div>
            </div>

            <div className="relative">
              <CheckeredLine color="#222222" />
            </div>

            <div className="flex flex-col gap-3 mb-6 w-[90%] justify-center items-start">
              <p className="text-xs text-[#A5A5A5] mb-2">Everything Basic, plus:</p>
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="p-0.5 ml-[-3.5px]">{feature.icon}</div>

                  <p className="text-xs text-[#A5A5A5]">{feature.content}</p>
                </div>
              ))}
            </div>

            <motion.div
              style={{ willChange: "transform" }}
              animate={{ y: isHovered ? "-20px" : "0" }}
              transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.5 }}
              className="w-full"
            >
              <PricingCardButton onClick={handleButtonClick} fullWidth={false} isBusy={busyKey === cardBusyKey}>
                {buttonConent}
              </PricingCardButton>
            </motion.div>

            <div className="w-full text-center">
              <p className="font-normal text-xs text-[#A5A5A5]">Switch plans or cancel anytime</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

function StarIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.37514 6.9862C4.24628 7.33445 3.75372 7.33445 3.62486 6.9862L2.98347 5.25286C2.94295 5.14337 2.85663 5.05705 2.74714 5.01653L1.0138 4.37514C0.665554 4.24628 0.665555 3.75372 1.0138 3.62486L2.74714 2.98347C2.85663 2.94295 2.94295 2.85663 2.98347 2.74714L3.62486 1.0138C3.75372 0.665555 4.24628 0.665555 4.37514 1.0138L5.01653 2.74714C5.05705 2.85663 5.14337 2.94295 5.25286 2.98347L6.9862 3.62486C7.33445 3.75372 7.33444 4.24628 6.9862 4.37514L5.25286 5.01653C5.14337 5.05705 5.05705 5.14337 5.01653 5.25286L4.37514 6.9862Z"
        fill="#F5E942"
      />
    </svg>
  );
}

export default PlusPlanCard;
