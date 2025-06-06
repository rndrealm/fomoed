"use client";

import React from "react";
import { Step } from "nextstepjs";
import { cn } from "@/lib/utils";

interface TourCardProps {
  step: Step;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  skipTour?: () => void;
  arrow: React.ReactNode;
}

const TourCard = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: TourCardProps) => {
  return (
    <div className="test-bg h-full  rounded-[16px] w-[325px] relative">
      <div className="walkthrough_border"></div>
      <div>
        <div className="flex items-center justify-between rounded-t-[16px] px-4 py-3 bg-[#E4350F]">
          <h3 className="text-base font-semibold text-white">{step.title}</h3>
        </div>
        <div className="px-4 py-3 ">
          <p className="text-[#C3C3C3] font-medium text-sm pb-3">
            {step.content}
          </p>
          <div className="flex items-center gap-1 mt-3">
            {new Array(totalSteps).fill(0).map((stp, i) => (
              <div
                key={i}
                className={cn("w-2 h-2 border rounded-full ", {
                  "bg-white": i <= currentStep,
                })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourCard;
