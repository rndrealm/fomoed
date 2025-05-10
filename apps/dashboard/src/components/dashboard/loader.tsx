import React from "react";
import { SkeletonLoader } from "../shared";
import { utilsAtom } from "@/lib/atoms/utilsAtom";
import { useAtom } from "jotai";
import { FullscreenBtn } from "./fullscreen-btn";
import { cn } from "@/lib/utils";

function TabLoader() {
  return <SkeletonLoader width="130" height="32" borderRadius="6" />;
}

function WidgetLoader() {
  return (
    <div className="flex flex-col gap-3 bg-[#080808]  rounded-2xl py-3 px-6 flex-1">
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <SkeletonLoader width="32" height="32" borderRadius="4" />
          <div className="flex flex-col gap-1">
            <SkeletonLoader width="62" height="18" borderRadius="4" />
            <SkeletonLoader width="155" height="18" borderRadius="4" />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <SkeletonLoader width="250" height="34" borderRadius="4" />
        </div>
      </div>

      <div className="">
        <SkeletonLoader widthFull height="340" borderRadius="12" />
      </div>

      <div className="">
        <SkeletonLoader width="247" height="18" borderRadius="4" />
      </div>
    </div>
  );
}

export function Loader() {
  const [utils] = useAtom(utilsAtom);

  return (
    <div
      className={cn(
        "h-screen pt-[96px] px-4 pb-4 overflow-hidden bg-[#0C0C0C]",
        !utils.isFullScreen ? "pt-[96px] px-4 pb-4" : "p-1"
      )}
    >
      <div className="relative flex flex-col w-full h-full gap-4">
        <div className="px-6">
          <div className="flex items-center gap-2">
            <SkeletonLoader width="32" height="32" borderRadius="16" />
            {Array(3)
              .fill(0)
              .map((_, index) => {
                return <TabLoader key={index} />;
              })}
          </div>
        </div>
        <div className="flex-1 border border-[#333333] bg-[#0F0F0F] overflow-hidden rounded-[20px] p-5 flex flex-col gap-5">
          {/* <DashboardContent /> */}
          <div className="flex gap-5">
            <WidgetLoader />
            <WidgetLoader />
          </div>
          <div className="flex gap-5">
            <WidgetLoader />
            <WidgetLoader />
          </div>
        </div>
      </div>
    </div>
  );
}
