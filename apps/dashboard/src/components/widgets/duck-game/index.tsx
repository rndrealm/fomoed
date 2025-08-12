"use client";
import React, { Fragment, useState } from "react";
import { WidgetWrapper } from "../shared";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { ModalContainer } from "@/components/shared";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { DuckInProgress, DuckPlay, Play } from "@/components/icons/icons";

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function DuckGame(props: IProps) {
  const { widget } = props;
  const [isFullScreen, setIsFullscreen] = useState(false);

  return (
    <Fragment>
      <WidgetWrapper
        title="Duck Game"
        widget={widget}
        handleLearnMore={() => {
          // setShowInfo(true);
        }}
        className="gap-3 !px-0 !pb-0 rounded-[30px]"
        headerClassName="bg-[#000] pb-0 px-2 sm:px-4"
        isDuckGame
        titleIcon="none"
      >
        <div className="h-full w-full flex items-center justify-end px-4 app_duck_game">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex">
                  <div className="flex items-center justify-between gap-2 bg-[#78FA5A] rounded-lg py-1 px-[10px]">
                    <DuckInProgress />
                    <p className="text-[#092D06] tracking-[-2%] leading-[1.5] font-semibold text-[10px]">
                      In Progress
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
                    450 $DUCK on Sol
                  </p>
                </div>
              </div>
            </div>

            <div className="flex">
              <button
                onClick={() => {
                  setIsFullscreen(true);
                }}
                type="button"
                className="h-[40px] px-4 flex gap-2 items-center justify-center text-white text-sm rounded-lg bg-gradient-to-b from-[#06495e] to-[#062a35] shadow-[inset_0_0_4px_0_rgba(79,79,79,0.25)]"
              >
                <DuckPlay />
                Play Now
              </button>
            </div>
          </div>
        </div>
      </WidgetWrapper>

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
