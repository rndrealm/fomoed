import React from "react";
import { Close, UpgradeStar } from "../icons/icons";
import { PlanType } from "@/lib/plans/plans.types";
import Link from "next/link";

const dataMap: Partial<
  Record<PlanType, { title: string; details: string; planName: string }>
> = {
  // Not sure what are the Plus features at this time, rn I need only the PRO plan
  //
  //   PLUS: {
  //     title: "Upgrade to Plus",
  //     details:
  //       "Get unlimited access to 10+ Tabs, 44+ crypto assets, smart signals with Fomoed pro",
  //   },
  pro: {
    title: "Upgrade to PRO",
    details:
      "Get access to 10+ Tabs, 44+ crypto assets and Smart Signals with the PRO plan",
    planName: "Fomoed Pro",
  },
};

interface IProps {
  upgradeToPlan: PlanType;
  handleClose?: () => void;
}

export function UpgradeTo(props: IProps) {
  const { upgradeToPlan, handleClose } = props;

  return (
    <div
      className="rounded-[24px] p-6 min-h-[455px] flex flex-col relative"
      style={{
        background:
          "linear-gradient(180deg, #ff3b10 11.24%, #aa290d 38.5%, #711e0b 47%, #51170a 51.76%, #220d09 62.01%, #080808 77.01%)",
      }}
    >
      <div className="flex justify-center items-center flex-1">
        <UpgradeStar />
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-white leading-[1.35] text-xl">
            {dataMap[upgradeToPlan]?.title}
          </h4>

          <p className="font-medium text-[15px] leading-[1.35] text-[#b9b9b9]">
            {dataMap[upgradeToPlan]?.details}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <Link
            className="rounded-md bg-white py-2 text-xs text-black font-medium leading-[1.5]"
            href="/pricing"
          >
            Upgrade to {dataMap[upgradeToPlan]?.planName}
          </Link>

          <div className="flex justify-center">
            {/* <button
              type="button"
              className="rounded-md py-2 text-xs text-[#b9b9b9] font-medium leading-[1.5] underline"
              onClick={handleGoToPlans}
            >
              View other plans
            </button> */}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="absolute top-[16px] right-[16px] w-[28px] h-[28px] rounded-[16px] bg-[#A52B11] flex items-center justify-center"
        onClick={handleClose}
      >
        <Close />
      </button>
    </div>
  );
}
