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
    <div className="flex flex-1 flex-col gap-3 rounded-2xl bg-[#080808] px-6 py-3 border-[#1b1b1b] border">
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <SkeletonLoader width="32" height="32" borderRadius="4" />
          <div className="flex flex-col gap-1">
            <SkeletonLoader width="62" height="18" borderRadius="4" />
            <SkeletonLoader width="155" height="18" borderRadius="4" />
          </div>
        </div>

        <div className="flex items-center gap-2">
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
    <div className={cn("h-screen overflow-hidden pb-4 app_dot_pattern_bg", !utils.isFullScreen ? "pb-4" : "pb-1")}>
      <div className="relative flex h-full w-full flex-col gap-y-3">
        <div className="px-6 bg-[#0A0A0A] h-[63px]">
          <div className="flex items-center gap-2 h-full">
            {/* <SkeletonLoader width="32" height="32" borderRadius="16" /> */}
            {Array(3)
              .fill(0)
              .map((_, index) => {
                return <TabLoader key={index} />;
              })}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-hidden rounded-[20px] px-3">
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
