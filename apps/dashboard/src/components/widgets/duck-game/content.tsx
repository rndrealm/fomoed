import React, { useState } from "react";
import Image from "next/image";
import { DuckInProgress, DuckPlay } from "@/components/icons/icons";
import dashboard from "@/lib/assets/dashboard";
import { useSocketEvent } from "./use-socket";
import { cn } from "@/lib/utils";
import { RenderIf } from "@/components/shared";

interface IProps {
  handleFullScreen: () => void;
}

export default function Content(props: IProps) {
  const { handleFullScreen } = props;
  const [raceInProgress, setRaceInProgress] = useState(false);
  const [pool, setPool] = useState(0);

  useSocketEvent("race_state_update", (data: any) => {
    console.log("Race State Update:", data);
    setRaceInProgress(true);
  });

  useSocketEvent("pool_update", (data: any) => {
    setPool(data?.[0]?.bet_type_pools?.["1"] || 0);
  });

  useSocketEvent("race_finished", (data: any) => {
    console.log("Race Finished:", data);
    setRaceInProgress(false);
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex">
            <div
              className={cn(
                "flex items-center justify-between gap-2 bg-[#78FA5A] rounded-lg py-1 px-[10px]",
              )}
            >
              <RenderIf condition={raceInProgress}>
                <DuckInProgress />
              </RenderIf>
              <p className="text-[#092D06] tracking-[-2%] leading-[1.5] font-semibold text-[10px]">
                {raceInProgress ? "In Progress" : "New race"}
              </p>
            </div>
          </div>

          <h4 className="text-[#082B37] text-3xl font-semibold leading-[1.12] tracking-[-0.4%] ">
            Duck Race - Race Onchain
          </h4>
        </div>

        <div className="flex items-center gap-1">
          <p className="text-[#083240] text-sm font-medium leading-[1.35] tracking-[-2%] ">
            Rewards Pool
          </p>

          <div className="flex items-center justify-between bg-[linear-gradient(355deg,rgba(255,255,255,0.15)_0%,rgba(228,228,228,0.15)_100%)] rounded-full pr-[6px] gap-1">
            <Image
              src={dashboard.duckGameIcon}
              alt="duck game"
              className="w-[24px] h-[24px] rounded-full"
            />
            <p className="text-[#092D06] tracking-[-4%] leading-[1.35] font-semibold text-xs">
              {pool} $DUCK on Sol
            </p>
          </div>
        </div>
      </div>

      <div className="flex">
        <button
          onClick={handleFullScreen}
          type="button"
          className="h-[40px] px-4 flex gap-2 items-center justify-center text-white text-sm rounded-lg bg-gradient-to-b from-[#06495e] to-[#062a35] shadow-[inset_0_0_4px_0_rgba(79,79,79,0.25)]"
        >
          <DuckPlay />
          Play Now
        </button>
      </div>
    </div>
  );
}
