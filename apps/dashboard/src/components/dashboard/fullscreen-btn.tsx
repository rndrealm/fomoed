import React from "react";
import { RenderIf } from "../shared";
import { ExitFullScreen, FullScreen } from "../icons/icons";

interface IProps {
  handleFullscreen?: () => void;
  isFullscreen: boolean;
}

export function FullscreenBtn(props: IProps) {
  const { isFullscreen, handleFullscreen } = props;

  return (
    <div className="absolute bottom-[24px] right-[24px]">
      <button
        onClick={handleFullscreen}
        type="button"
        className="border border-[#1c1c1c] bg-[#111] p-[6px] rounded-md"
      >
        <RenderIf condition={!isFullscreen}>
          <FullScreen />
        </RenderIf>

        <RenderIf condition={isFullscreen}>
          <ExitFullScreen />
        </RenderIf>
      </button>
    </div>
  );
}
