"use client";
import React, { Fragment, useState } from "react";
import { WidgetWrapper } from "../shared";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { ModalContainer } from "@/components/shared";

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
        className="gap-3"
      >
        <div className="h-full flex items-center justify-center">
          <button
            onClick={() => {
              setIsFullscreen(true);
            }}
            type="button"
            className="w-full flex items-center justify-center bg-gray-800 text-white text-sm rounded-sm py-1"
          >
            Play Duck Game
          </button>
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
