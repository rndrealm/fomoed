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
    <div className="flex flex-1 flex-col gap-3 rounded-2xl bg-[#080808] px-6 py-3">
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
    <div
      className={cn(
        "h-screen overflow-hidden bg-[#0C0C0C] px-4 pt-[96px] pb-4",
        !utils.isFullScreen ? "px-4 pt-[96px] pb-4" : "p-1"
      )}
    >
      <div className="relative flex h-full w-full flex-col gap-4">
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
        <div className="flex flex-1 flex-col gap-5 overflow-hidden rounded-[20px] border border-[#333333] bg-[#0F0F0F] p-5">
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
