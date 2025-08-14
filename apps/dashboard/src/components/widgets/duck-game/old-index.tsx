"use client";
import React, { Fragment, useState } from "react";
import { WidgetWrapper } from "../shared";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { ModalContainer } from "@/components/shared";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { DuckInProgress, DuckPlay, Play } from "@/components/icons/icons";
import Content from "./content";

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
          <Content
            handleFullScreen={() => {
              setIsFullscreen(true);
            }}
          />
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
            src="https://duckracegp.com"
            className="w-full h-full"
          ></iframe>
        </div>
      </ModalContainer>
    </Fragment>
  );
}
