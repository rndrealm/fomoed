import React from "react";
import { Pause, Play, Sound } from "@/components/icons/icons";
import { RenderIf } from "@/components/shared";

interface IProps {
  handlePlay?: () => void;
  handlePause?: () => void;
  handleResume?: () => void;
  isPaused?: boolean;
  isSpeaking?: boolean;
  handleShowPlayer?: () => void;
}

export function PlayButton(props: IProps) {
  const { handleShowPlayer } = props;

  return (
    <button
      type="button"
      className="flex h-[32px] w-[56px] items-center justify-center gap-1 rounded-[40px] bg-[#0F0F0F]"
      onClick={handleShowPlayer}
    >
      <RenderIf condition={false}>
        <Pause />
      </RenderIf>

      <Play />

      <Sound />
    </button>
  );
}
