"use client";

import React, { useState } from "react";
import { PricingCard } from "../pricing-cards";
import ProPlanTriangleDown from "../../icons/ProPlanTriangleDown";
import ProPlanTriangleUp from "../../icons/ProPlanTriangleUp";
import { motion, AnimatePresence } from "motion/react";
import useSubscription from "@/hooks/subscription";
import { PricingCardButton } from "./pricing-card-common";

const ProPlanCard = ({
  title,
  prices,
  description,
  features,
  buttonConent,
  switchActive,
  buttonColorProminent,
  buttonAction,
}: PricingCard) => {
  const { changeSubscriptionMutation } = useSubscription();
  const [isHovered, setIsHovered] = useState(false);

  function handleButtonClick() {
    if (!buttonAction) throw new Error("Button action is not defined");

    changeSubscriptionMutation.mutate({
      action: buttonAction,
      billingPeriod: switchActive ? "yearly" : "monthly",
      plan: "pro",
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
      <div className="h-14 w-30 select-none absolute left-0 top-[-36px] rounded-tr-[12px]">
        <div className="w-full h-full relative p-[1px] overflow-hidden rounded-tr-[12px] flex items-center justify-center">
          <div className="gradient_border_proplan_button" />
          <div className="relative bg-gradient-pricing-recommended w-full h-full flex items-center justify-center rounded-tr-[12px]">
            <h3 className="mb-5 text-[14px] text-white">Recommended</h3>
          </div>
        </div>
      </div>

      <div
        className="relative h-full rounded-2xl backdrop-blur-2xl"
        // TOOD revert this
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          style={{ transformOrigin: "top center", willChange: "transform" }}
          className="inset-0 z-0 absolute w-full h-full rounded-[18px] bg-gradient-proplan-hover pt-[12px] pl-4.5"
          animate={{
            scaleX: isHovered ? 1.025 : 1,
            scaleY: isHovered ? 1.10175 : 1,
          }}
          transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.5 }}
        >
          <h3 className="text-[#59281d] font-bold text-xs">We highly recommend this plan</h3>
        </motion.div>

        <motion.div
          style={{ willChange: "transform" }}
          className="relative overflow-hidden p-[1px] h-full rounded-2xl "
          animate={{ y: isHovered ? "44px" : "0" }}
          transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.5 }}
        >
          <div className="gradient_border_proplan" />

          <div
            className="relative z-10 overflow-hidden h-full px-6 pt-6 pb-4 bg-[#030303] rounded-2xl
                flex flex-col justify-between items-start gap-5
                "
          >
            <div className="absolute z-[-8] bottom-0 left-0">
              <ProPlanTriangleDown />
            </div>

            <div className="absolute z-[-10] top-0 left-0">
              <ProPlanTriangleUp />
            </div>

            <div className="flex flex-col gap-6">
              <h2 className="text-base">{title}</h2>
              <div className="flex flex-col gap-4">
                {/* <div className='flex flex-row gap-2'>
                                    <span className='inline-block text-base text-[#878787]'>$</span>
                                    <h2 className='text-4xl'>
                                      
                                        <ProPlanPriceNumber />
                                    </h2>
                                </div> */}

                <div className="overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={switchActive ? prices[1] : prices[0]}
                      variants={variants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="text-4xl font-semibold"
                    >
                      {switchActive ? prices[1] : prices[0]}
                    </motion.h2>
                  </AnimatePresence>
                </div>

                <p className="text-base">{description}</p>
              </div>
            </div>

            <div className="relative z-[-9]">
              <div className="w-[312px] h-[1px] border-[1px] border-[#111111]"></div>
            </div>

            <div className="flex flex-col w-[90%] justify-center items-start gap-3 mb-4">
              <p className="text-[13px] text-[#A5A5A5] mb-2">Everything Basic, plus:</p>
              {features.map((feature, index) => {
                //Joshua Jake
                if (feature.content.includes("training")) {
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div className="p-0.5 ml-[-3.5px] mb-3">{feature.icon}</div>

                      <p className="text-xs text-[#A5A5A5] mt-1">
                        {feature.content}
                        <span
                          onClick={() => window.open("https://x.com/itzjoshuajake", "_blank")}
                          className="underline cursor-pointer text-xs text-[#FFFFFF] ml-1"
                        >
                          Joshua Jake
                        </span>
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="p-0.5 ml-[-3.5px]">{feature.icon}</div>

                    <p className="text-xs text-[#A5A5A5]">{feature.content}</p>
                  </div>
                );
              })}
            </div>

            <motion.div
              style={{ willChange: "transform" }}
              animate={{ y: isHovered ? "-20px" : "0" }}
              transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.5 }}
              className="w-full"
            >
              <PricingCardButton
                onClick={handleButtonClick}
                buttonColorProminent={buttonColorProminent}
                fullWidth={true}
              >
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

export default ProPlanCard;
