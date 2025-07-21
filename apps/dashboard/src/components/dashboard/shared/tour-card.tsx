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

const TourCard = ({ step, currentStep, totalSteps, nextStep, prevStep, skipTour, arrow }: TourCardProps) => {
  return (
    <div className="test-bg relative h-full w-[325px] rounded-[16px]">
      <div className="walkthrough_border"></div>
      <div>
        <div className="flex items-center justify-between rounded-t-[16px] bg-[#E4350F] px-4 py-3">
          <h3 className="text-base font-semibold text-white">{step.title}</h3>
        </div>
        <div className="px-4 py-3">
          <p className="pb-3 text-sm font-medium text-[#C3C3C3]">{step.content}</p>
          <div className="mt-3 flex items-center gap-1">
            {new Array(totalSteps).fill(0).map((stp, i) => (
              <div
                key={i}
                className={cn("h-2 w-2 rounded-full border", {
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
