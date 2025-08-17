"use client";
import React, { useState, useEffect, Fragment } from "react";
import { motion } from "motion/react";
import {
  DuckTrophy,
  Flag,
  FurthestDuck,
  Question,
  Stopwatch,
  Warning,
} from "@/components/icons/icons";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import {
  cn,
  formatCountdown,
  getAvatarUrl,
  splitWidgetSlug,
} from "@/lib/utils";
import { ModalContainer, RenderIf } from "@/components/shared";
import { useSocketEvent } from "./use-duck-game-socket";
import { PreviousRace, Race, RaceFinished, RaceUpdate } from "./types";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { forma } from "viem/chains";
import { useAtomValue, useSetAtom } from "jotai";
import { settingAtom, updateSettingAtom } from "@/lib/atoms/settingsAtom";
import StarFilled from "@/components/icons/StarFilled";
import Star from "@/components/icons/Star";
import { OptionsDropdown } from "../shared/options-dropwdown";

interface IProps {
  widget: LayoutType["widgets"][0];
}

interface INextRaceInfo {
  time: Date | string;
}

function NextRaceInfo(props: INextRaceInfo) {
  const { time } = props;
  const [countdown, setCountdown] = useState(formatCountdown(time || ""));

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(formatCountdown(time || ""));
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 500);

    return () => clearInterval(intervalId);
  }, [time]);

  return (
    <p className="font-semibold text-[10px] leading-[1.35] tracking-[-0.4%] text-[#5A5A5A]">
      Next Race In: {countdown}
    </p>
  );
}

export default function Index(props: IProps) {
  const { widget } = props;
  const [previousRace, setPreviousRace] = useState<PreviousRace | null>(null);
  const [raceUpdate, setRaceUpdate] = useState<RaceUpdate | null>(null);
  const [raceFinished, setRaceFinished] = useState<RaceFinished | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [isLiveRace, setIsLiveRace] = useState(false);
  const [isFullScreen, setIsFullscreen] = useState(false);
  // useSocketEvent("pool_update", (data: any) => {
  //   console.log("pool_update", data);
  // });

  const settings = useAtomValue(settingAtom);
  const updateSettings = useSetAtom(updateSettingAtom);

  const widgetSlug = splitWidgetSlug(widget.meta.i).slug;

  // Use the widget ID to create a unique socket connection for this widget instance
  const widgetId = widget.meta.i;

  // Log component lifecycle
  useEffect(() => {
    console.log(`Duck Game widget ${widgetId} mounted`);
    return () => {
      console.log(
        `Duck Game widget ${widgetId} unmounted - cleaning up resources`,
      );
    };
  }, [widgetId]);

  useSocketEvent(widgetId, "races", (data: PreviousRace) => {
    // Sort ducks by position (higher position first) if available in previous races data
    if (
      data.previous_races &&
      data.previous_races.ducks &&
      Array.isArray(data.previous_races.ducks)
    ) {
      data.previous_races.ducks.sort((a, b) => b.position - a.position);
    }

    setPreviousRace(data);
  });

  useSocketEvent(widgetId, "race_state_update", (data: RaceUpdate) => {
    // Sort ducks by position (higher position first)
    if (data.ducks && Array.isArray(data.ducks)) {
      data.ducks.sort((a, b) => b.position - a.position);
    }

    setRaceUpdate(data);
    setIsLiveRace(true);
  });

  useSocketEvent(widgetId, "race_finished", (data: RaceFinished) => {
    setRaceFinished(data);
    setIsLiveRace(false);
  });

  useSocketEvent(widgetId, "pool_update", (data: Race[]) => {
    setRaces(data);
  });

  const timeElapsedInSeconds = isLiveRace
    ? ((raceUpdate?.current_time || 0) % 60).toString().padStart(2, "0")
    : "00";

  const timeElapsedInMinutes = isLiveRace
    ? Math.floor((raceUpdate?.current_time || 0) / 60000)
        .toString()
        .padStart(2, "0")
    : "00";

  const farthestDuck =
    raceUpdate?.ducks[0]?.position.toFixed(2) ||
    previousRace?.previous_races?.podium?.[0]?.position.toFixed(2) ||
    "0.00";

  const handleFavourite = () => {
    const isFavorite = settings.favorite_widgets.includes(widgetSlug);

    let newWidgetArray: string[] = [];

    if (isFavorite) {
      newWidgetArray = settings.favorite_widgets.filter(
        (item) => item !== widgetSlug,
      );
    } else {
      newWidgetArray = [...settings.favorite_widgets, widgetSlug];
    }
    updateSettings({
      ...settings,
      favorite_widgets: newWidgetArray,
    });
  };

  // console.log(previousRace);

  return (
    <Fragment>
      <div className="relative flex h-full flex-col gap-0 rounded-2xl bg-white pt-0 pb-0 overflow-hidden">
        <div className="flex flex-col gap-0">
          <div className="flex cursor-grab justify-center pt-4 pb-1">
            <div className="h-[5px] w-[36px] rounded-[2px] bg-[#444]"></div>
          </div>

          <div className="flex flex-col px-4 gap-4 border-b border-[#EDEDED] pb-4">
            <div className="mb-1 flex items-center justify-between ">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-[20px] h-[20px] flex items-center justify-center">
                  <Flag />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-sm leading-[1.35] tracking-[-0.4%] text-[#878787]">
                    Live race info
                  </p>

                  <p className="font-semibold text-sm leading-[1.35] tracking-[-0.4%] text-[#0A0A0A]">
                    Race #
                    {raceUpdate?.race_id ||
                      previousRace?.previous_races?.race_id}
                  </p>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <RenderIf condition={isLiveRace}>
                  <div
                    className={cn(
                      "h-[24px] rounded-3xl bg-[#EA2833] w-[57px] flex items-center justify-center gap-[6px]",
                    )}
                  >
                    <div className="w-[4px] h-[4px] rounded-full bg-white"></div>
                    <p className="font-semibold text-[10px] leading-[1.35] tracking-[-0.4%] text-white">
                      Live
                    </p>
                  </div>
                </RenderIf>

                <RenderIf condition={!isLiveRace}>
                  <div
                    className={cn(
                      "h-[24px] rounded-3xl bg-[#F2F2F2] w-[142px] flex items-center justify-center gap-[6px]",
                    )}
                  >
                    <div className="w-[4px] h-[4px] rounded-full bg-[#5A5A5A]"></div>
                    <NextRaceInfo time={races[0]?.time_slot} />
                  </div>
                </RenderIf>
              </div>
              <div className="flex items-center justify-end gap-2 flex-1">
                <button onClick={handleFavourite}>
                  {settings.favorite_widgets.includes(widgetSlug) ? (
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: [-30, 30, -15, 15, 0] }}
                      transition={{
                        duration: 1,
                        times: [0, 0.2, 0.4, 0.8, 1],
                      }}
                    >
                      <StarFilled />
                    </motion.div>
                  ) : (
                    <Star />
                  )}
                </button>
                {/* <button
                  type="button"
                  onClick={() => {
                    setShowInfo(true);
                  }}
                >
                  <Question />
                </button> */}
                <OptionsDropdown variant="white" widget={widget} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="w-[20px] h-[20px] flex items-center justify-center">
                  <Stopwatch />
                </div>

                <div className="flex flex-col">
                  <p className="font-medium text-xs leading-[1.35] tracking-[-0.4%] text-[#878787]">
                    Time Elapsed
                  </p>

                  <p className="font-semibold text-sm leading-[1.35] tracking-[-0.4%] text-[#0A0A0A]">
                    {timeElapsedInMinutes}:{timeElapsedInSeconds}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-[20px] h-[20px] flex items-center justify-center">
                  <FurthestDuck />
                </div>

                <div className="flex flex-col">
                  <p className="font-medium text-xs leading-[1.35] tracking-[-0.4%] text-[#878787]">
                    Furthest Duck
                  </p>

                  <p className="font-semibold text-sm leading-[1.35] tracking-[-0.4%] text-[#0A0A0A]">
                    {farthestDuck}m
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-[20px] h-[20px] flex items-center justify-center">
                  <DuckTrophy />
                </div>

                <div className="flex flex-col">
                  <p className="font-medium text-xs leading-[1.35] tracking-[-0.4%] text-[#878787]">
                    Finished
                  </p>

                  <p className="font-semibold text-sm leading-[1.35] tracking-[-0.4%] text-[#0A0A0A]">
                    {isLiveRace ? "No" : "Yes"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-[20px] h-[20px] flex items-center justify-center">
                  <Warning />
                </div>

                <div className="flex flex-col">
                  <p className="font-medium text-xs leading-[1.35] tracking-[-0.4%] text-[#878787]">
                    Sponsor
                  </p>

                  <p className="font-semibold text-sm leading-[1.35] tracking-[-0.4%] text-[#0A0A0A]">
                    {raceUpdate?.race_sponsor || "None"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 pb-4 flex-1 overflow-y-auto scrollbar">
          <div className=""></div>
          <div className="p-[2px] bg-[#E3E3E3] rounded-lg flex flex-col">
            <div className="flex justify-between items-center bg-[#F8F8F8] rounded-md p-3">
              <div className="flex items-center gap-4">
                <div className="w-[40px] h-[40px]">
                  <Image
                    src={dashboard.duckTrophy}
                    className="w-full"
                    alt="duck trophy"
                  />
                </div>
                <div className="flex flex-col gap-[2px]">
                  <p className="font-medium text-xs leading-[1.35] tracking-[-0.4%] text-[#0A0A0A]">
                    Reward Pool
                  </p>

                  <div className="flex gap-1 items-center">
                    <div className="w-[20px] h-[20px]">
                      <Image
                        src={dashboard.duckGameIcon}
                        className="w-full"
                        alt="duck logo"
                      />
                    </div>
                    <p className="font-semibold text-base leading-[1.35] tracking-[-0.4%] text-[#0A0A0A]">
                      {raceUpdate?.race_pool?.[0] || 0} $duck
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-[124px] h-[40px]"
                onClick={() => {
                  setIsFullscreen(true);
                }}
              >
                <Image
                  src={dashboard.duckPlay}
                  alt="play"
                  className="w-full h-full"
                />
              </button>
            </div>
            <div className="flex py-[10px] px-3">
              {/* <motion.div
                className="h-[8px] rounded-4xl bg-[linear-gradient(270deg,#febd0e_0%,#81ab9a_49.36%,#00af58_100%)]"
                initial={{ width: 0 }}
                animate={{
                  width: `${((raceUpdate?.current_time || 0) / 30) * 100}%`,
                }}
                transition={{
                  duration: 1,
                  ease: [0.16, 1, 0.3, 1], // cubic-bezier for smooth acceleration & gentle stop
                }}
              /> */}
            </div>
          </div>

          <p className="text-xs font-medium tracking-[-0.4%] leading-[1.35] text-[#0A0A0A]">
            The Ducks - Live Race
          </p>

          <div className="flex flex-col pb-4">
            <table className="w-full table-auto relative">
              <thead className="sticky top-0 z-10 bg-[#EDEDED] border-b border-[#EDEDED] shadow-sm">
                <tr>
                  <th className="cursor-pointer p-3 text-left text-xs leading-[1.35] tracking-[-0.4%] whitespace-nowrap text-[#878787] rounded-tl-[10px]">
                    PLACE
                  </th>

                  <th className="cursor-pointer p-3 text-left text-xs leading-[1.35] tracking-[-0.4%] whitespace-nowrap text-[#878787]">
                    PLACE
                  </th>
                  <th className="cursor-pointer p-3 text-left text-xs leading-[1.35] tracking-[-0.4%] whitespace-nowrap text-[#878787]">
                    DISTANCE (M)
                  </th>
                  <th className="cursor-pointer p-3 text-left text-xs leading-[1.35] tracking-[-0.4%] whitespace-nowrap text-[#878787]">
                    WEIGHT
                  </th>
                  <th className="cursor-pointer p-3 text-left text-xs leading-[1.35] tracking-[-0.4%] whitespace-nowrap text-[#878787] rounded-tr-[10px]">
                    PROGRESS
                  </th>
                </tr>
              </thead>
              <tbody>
                {(
                  raceUpdate?.ducks || previousRace?.previous_races?.ducks
                )?.map((item, index) => {
                  const isFirst = index === 0;
                  const isPodium = index < 3;

                  return (
                    <motion.tr
                      layout
                      key={item.id}
                      style={{ borderBottom: "1px solid #EDEDED" }}
                    >
                      <td className="py-3">
                        <div className="flex">
                          <div
                            className={cn(
                              "flex border items-center border-[#C6C4BF] justify-center h-[20px] w-[20px] gap-1 bg-[#E8E8E7] rounded-full",
                              isFirst && "bg-[#FFE7A5] border-[#FEBD0E]",
                              isPodium && "w-[38px]",
                            )}
                          >
                            <p className="text-xs leading-[1.08] text-[#0A0A0A] tracking-[-0.4%] font-medium">
                              {index + 1}
                            </p>
                            <RenderIf condition={isPodium}>
                              <Image
                                src={dashboard.medal}
                                alt="medal"
                                className="w-[16px] h-[16px]"
                              />
                            </RenderIf>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2 items-center">
                          <div className="w-[32px] h-[32px] rounded-full overflow-hidden">
                            <Image
                              src={getAvatarUrl(item?.name)}
                              width={32}
                              height={32}
                              alt="duck game"
                              className="w-full h-full"
                            />
                          </div>

                          <div className="flex flex-col">
                            <p className="text-xs leading-[1.35] text-[#0A0A0A] tracking-[-0.4%] font-medium text-uppercase">
                              {item?.name}
                            </p>

                            <p className="text-[10px] leading-[1.35] text-[#878787] tracking-[-0.4%] font-medium">
                              Lane 1
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs font-medium leading-[1.35] tracking-[-0.4%] whitespace-nowrap text-[#0A0A0A]">
                        {item?.position?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-3 py-2 text-xs font-medium leading-[1.35] tracking-[-0.4%] whitespace-nowrap text-[#0A0A0A]">
                        {item?.weight?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-3 py-2 text-right text-[13px] leading-[1] whitespace-nowrap text-white">
                        <div className="w-[140px] h-[8px] rounded-4xl overflow-hidden bg-[#ECECEC]">
                          <motion.div
                            className="h-full rounded-4xl bg-[linear-gradient(270deg,#febd0e_0%,#81ab9a_49.36%,#00af58_100%)]"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(item?.position / (raceUpdate?.max_position || previousRace?.previous_races?.ducks?.[0]?.position || 100)) * 100 || 0}%`,
                            }}
                            transition={{
                              duration: 0.4,
                              ease: [0.16, 1, 0.3, 1], // cubic-bezier for smooth acceleration & gentle stop
                            }}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalContainer
        open={isFullScreen}
        handleClose={() => {
          setIsFullscreen(false);
        }}
        className="!sm:w-[100%] h-[100%] max-h-[100%] !w-[100%] !max-w-[100%] rounded-[0] !p-4"
      >
        <div className="w-full h-full">
          <iframe
            src="https://duckracegp.com?referral=fomoed"
            className="w-full h-full"
          ></iframe>
        </div>
      </ModalContainer>
    </Fragment>
  );
}
