import React from "react";
import Image from "next/image";
import { CloseTab, MiniPause, MiniPlay, MiniPrevious } from "@/components/icons/icons";
import { RenderIf } from "@/components/shared";
import {
  audioPlaylistAtom,
  closeMiniPlayerAtom,
  currentAudioAtom,
  currentAudioIndexAtom,
  isAudioPlayingAtom,
  nextTrackAtom,
  pauseAudioAtom,
  playAudioAtom,
  prevTrackAtom,
} from "@/lib/atoms/audio";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { AnimatePresence, motion } from "motion/react";

export function MiniPlayer() {
  const currentTrack = useAtomValue(currentAudioAtom);

  const currentIndex = useAtomValue(currentAudioIndexAtom);
  const playlist = useAtomValue(audioPlaylistAtom);
  const nextTrack = useSetAtom(nextTrackAtom);
  const prevTrack = useSetAtom(prevTrackAtom);
  const [isPlaying, setIsPlaying] = useAtom(isAudioPlayingAtom);
  const playAudio = useSetAtom(playAudioAtom);
  const pauseAudio = useSetAtom(pauseAudioAtom);
  const closeMiniPlayer = useSetAtom(closeMiniPlayerAtom);

  const isFirstTrack = currentIndex === 0;
  const isLastTrack = playlist?.length > 0 ? currentIndex === playlist.length - 1 : true;

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          className="fixed bottom-[74px] left-[50%] h-[48px] w-full max-w-[394px] translate-x-[-50%] rounded-[10px] bg-[black] px-2"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="flex h-full items-center justify-between gap-4">
            <div className="flex flex-1 items-center justify-between gap-2">
              <button
                type="button"
                className="h-[20px]flex w-[20px] items-center justify-between"
                onClick={closeMiniPlayer}
              >
                <CloseTab fill="#8E8E8E" />
              </button>

              <div className="flex h-[24px] w-[24px]">
                <RenderIf condition={!!currentTrack?.image_url}>
                  <Image
                    src={currentTrack?.image_url}
                    alt="news"
                    height={24}
                    width={24}
                    className="h-full w-full rounded-sm object-cover"
                  />
                </RenderIf>
              </div>

              <p className="line-clamp-1 flex-1 text-[13px] leading-[18px] font-semibold tracking-[-0.4%] text-[#BBBBBB]">
                {currentTrack?.title}
              </p>
            </div>

            <div className="flex items-center gap-[3px]">
              <button
                type="button"
                className="flex h-[20px] w-[20px] items-center justify-center"
                disabled={isFirstTrack}
                onClick={prevTrack}
              >
                <MiniPrevious />
              </button>

              <button
                type="button"
                className="flex h-[24px] w-[24px] items-center justify-center"
                onClick={() => {
                  if (isPlaying) {
                    pauseAudio();
                  } else {
                    playAudio();
                  }
                }}
              >
                <RenderIf condition={isPlaying}>
                  <MiniPause />
                </RenderIf>

                <RenderIf condition={!isPlaying}>
                  <MiniPlay />
                </RenderIf>
              </button>

              <button
                type="button"
                className="flex h-[20px] w-[20px] items-center justify-center"
                disabled={isLastTrack}
                onClick={nextTrack}
              >
                <MiniPrevious rotate />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
