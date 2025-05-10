import React from "react";
import { UpgradeStar } from "../icons/icons";

const dataMap = {
  tab: {
    title: "Upgrade to pro",
    details:
      "Get unlimited access to 10+ Tabs, 44+ crypto assets with Fomoed pro",
  },
  // chart: {
  //   title: "Upgrade to pro",
  //   details:
  //     "Get unlimited access to 20+ Tabs, 44+ crypto assets with Fomoed pro",
  // },
};

export function Upgrade() {
  function handleGoToPlans() {
    window.location.href =
      "https://fomoed-git-development-fomoed-00ef5fc1.vercel.app/plans";
  }

  return (
    <div
      className="rounded-[24px] p-6 min-h-[455px] flex flex-col"
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
            {dataMap.tab.title}
          </h4>

          <p className="font-medium text-[15px] leading-[1.35] text-[#b9b9b9]">
            {dataMap.tab.details}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="rounded-md bg-white py-2 text-xs text-black font-medium leading-[1.5]"
            onClick={handleGoToPlans}
          >
            Upgrade to Fomoed+
          </button>

          <div className="flex justify-center">
            <button
              type="button"
              className="rounded-md py-2 text-xs text-[#b9b9b9] font-medium leading-[1.5] underline"
              onClick={handleGoToPlans}
            >
              View other plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
