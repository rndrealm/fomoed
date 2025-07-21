import React from "react";
import { Pause, Play, Sound } from "@/components/icons/icons";
import { RenderIf } from "@/components/shared";

interface IProps {
  handlePlay?: () => void;
  handlePause?: () => void;
  handleResume?: () => void;
  isPaused?: boolean;
  isSpeaking?: boolean;
}

export function PlayButton(props: IProps) {
  const { handlePause, handlePlay, handleResume, isPaused = false, isSpeaking = false } = props;

  const handleClick = () => {
    if (!isSpeaking) {
      handlePlay?.(); // not speaking, start speaking
    } else if (isPaused) {
      handleResume?.(); // paused, resume
    } else {
      handlePause?.(); // speaking and not paused, pause
    }
  };

  return (
    <button
      type="button"
      className="flex h-[32px] w-[56px] items-center justify-center gap-1 rounded-[40px] bg-[#0F0F0F]"
      onClick={handleClick}
    >
      <RenderIf condition={isSpeaking && !isPaused}>
        <Pause />
      </RenderIf>

      <RenderIf condition={!isSpeaking || isPaused}>
        <Play />
      </RenderIf>

      <Sound />
    </button>
  );
}
