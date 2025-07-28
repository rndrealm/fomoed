import Image from "next/image";
import React, { useEffect } from "react";
import {
  Article,
  BigPlay,
  Close,
  Forward10,
  MiniPause,
  Previous,
  Queue,
  Rewind10,
  Settings,
  Stack,
} from "@/components/icons/icons";
import dashboard from "@/lib/assets/dashboard";
import { useAtomValue, useSetAtom } from "jotai";
import { motion } from "motion/react";
import {
  audioDurationAtom,
  audioPlaylistAtom,
  audioProgressAtom,
  audioRefAtom,
  currentAudioAtom,
  currentAudioIndexAtom,
  isAudioPlayingAtom,
  nextTrackAtom,
  pauseAudioAtom,
  playAudioAtom,
  prevTrackAtom,
  seekAudioAtom,
  setPlaylistAtom,
} from "@/lib/atoms/audio";
import { NewsFeedItem } from "@/services/queries/news/types";
import { RenderIf } from "@/components/shared";
import { formatAudioTime } from "@/lib/utils";

interface IProps {
  handleClose: () => void;
  news: NewsFeedItem[];
}

interface IPlayerItem {
  data: NewsFeedItem;
  onClick?: () => void;
}

function PlayerItem(props: IPlayerItem) {
  const { data, onClick } = props;

  return (
    <button type="button" className="flex items-center gap-2 text-left" onClick={onClick}>
      <div className="h-[54px] w-[54px] overflow-hidden rounded-sm">
        <RenderIf condition={!!data?.image_url}>
          <Image src={data?.image_url} className="h-full w-full object-cover" width={54} height={53} alt="news" />
        </RenderIf>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <p className="line-clamp-2 text-sm leading-[1] text-white">{data?.title}</p>
        {/* <p className="text-xs leading-[16px] text-[#A4A4A4]">1:10</p> */}
      </div>
    </button>
  );
}

function ProgressBar() {
  const audioProgress = useAtomValue(audioProgressAtom);
  const audioDuration = useAtomValue(audioDurationAtom);

  const width = (audioProgress / audioDuration) * 100;

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-center gap-2">
        <p className="text-xs leading-[16px] text-[#A4A4A4]">{formatAudioTime(audioProgress)} </p>
        <div className="relative h-[4px] w-full rounded-full bg-[rgba(110,110,110,0.4)]">
          <motion.div
            animate={{
              width: `${Number(width) || 0}%`,
            }}
            transition={{
              type: "tween",
              ease: "linear",
              duration: 0.2, // slight delay to feel responsive but not jittery
            }}
            className="absolute top-0 bottom-0 left-0 w-[0] rounded-full bg-white"
          ></motion.div>
        </div>
        <p className="text-xs leading-[16px] text-[#A4A4A4]">{formatAudioTime(audioDuration)} </p>
      </div>
      <div className="flex items-center justify-center gap-4 px-3 py-2">
        <button type="button" className="flex h-[16px] w-[16px] items-center justify-center">
          <Article />
        </button>

        <button type="button" className="flex h-[16px] w-[16px] items-center justify-center">
          <Stack />
        </button>

        <button type="button" className="flex h-[16px] w-[16px] items-center justify-center">
          <Settings />
        </button>
      </div>
    </div>
  );
}

export default function Player(props: IProps) {
  const { handleClose, news } = props;

  const currentIndex = useAtomValue(currentAudioIndexAtom);
  const isPlaying = useAtomValue(isAudioPlayingAtom);
  const playAudio = useSetAtom(playAudioAtom);
  const pauseAudio = useSetAtom(pauseAudioAtom);
  const currentTrack = useAtomValue(currentAudioAtom);
  const playlist = useAtomValue(audioPlaylistAtom);
  const setPlaylist = useSetAtom(setPlaylistAtom);
  const nextTrack = useSetAtom(nextTrackAtom);
  const prevTrack = useSetAtom(prevTrackAtom);
  const seekTrack = useSetAtom(seekAudioAtom);

  const isFirstTrack = currentIndex === 0;
  const isLastTrack = playlist?.length > 0 ? currentIndex === playlist.length - 1 : true;

  // console.log(currentTrack);

  return (
    <div className="flex w-full flex-col gap-2 overflow-hidden rounded-3xl bg-[linear-gradient(192deg,_#204894_7.94%,_#132c59_19.83%,_#0b1932_36.62%,_#040a15_51.99%,_#000_61.43%)]">
      <div className="flex flex-col gap-2 px-4 pt-4">
        <div className="flex justify-end">
          <button
            type="button"
            className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#223F76]"
            onClick={handleClose}
          >
            <Close />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex w-full flex-1 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h5 className="text-xs leading-[16px] text-[#A4A4A4]">Play From</h5>
              <p className="line-clamp-2 text-sm leading-[1] text-white">{currentTrack?.title}</p>
            </div>
            {/* <div className="flex w-full flex-col gap-2">
              <div className="h-[2px] w-full rounded-[1px] bg-[#6E6E6E]"></div>
              <div className="flex items-center justify-between">
                <p className="text-xs leading-[16px] text-[#A4A4A4]">-1:10</p>
                <p className="text-xs leading-[16px] text-[#A4A4A4]">0:03</p>
              </div>
            </div> */}
          </div>

          <div className="h-[80px] w-[80px] overflow-hidden rounded-md">
            <RenderIf condition={!!currentTrack?.image_url}>
              <Image
                src={currentTrack?.image_url}
                width={90}
                height={90}
                className="h-full w-full object-cover"
                alt="news"
              />
            </RenderIf>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex items-center gap-1 px-4">
            <Queue />
            <p className="text-xs leading-[16px] text-[#BBBBBB]">In Queue</p>
          </div>
          <div className="scrollbar flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
            {news.map((item, index) => {
              return (
                <PlayerItem
                  key={item?.id}
                  data={item}
                  onClick={() => {
                    const isSameTrack = playlist?.[currentIndex]?.id === item.id;

                    if (isSameTrack) {
                      // Restart current track
                      seekTrack("start");
                      return;
                    }

                    setPlaylist({ playlist: news, startIndex: index });
                  }}
                />
              );
            })}
          </div>
        </div>
        <div className="flex justify-center bg-[#000000] py-4">
          <div className="flex w-full flex-col items-center gap-1 px-8">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-[32px] w-[32px] items-center justify-center"
                onClick={prevTrack}
                disabled={isFirstTrack}
              >
                <Previous />
              </button>
              <button
                type="button"
                className="flex h-[32px] w-[32px] items-center justify-center"
                onClick={() => {
                  seekTrack(-10);
                }}
              >
                <Rewind10 />
              </button>
              <button
                type="button"
                className="flex h-[32px] w-[32px] items-center justify-center"
                onClick={() => {
                  if (playlist.length === 0) {
                    setPlaylist({ playlist: news });
                    return;
                  }
                  if (isPlaying) {
                    pauseAudio();
                  } else {
                    playAudio();
                  }
                }}
              >
                <RenderIf condition={isPlaying}>
                  <MiniPause big />
                </RenderIf>

                <RenderIf condition={!isPlaying}>
                  <BigPlay />
                </RenderIf>
              </button>
              <button
                type="button"
                className="flex h-[32px] w-[32px] items-center justify-center"
                onClick={() => {
                  seekTrack(10);
                }}
              >
                <Forward10 />
              </button>
              <button
                type="button"
                className="flex h-[32px] w-[32px] items-center justify-center"
                onClick={nextTrack}
                disabled={isLastTrack}
              >
                <Previous rotate />
              </button>
            </div>

            <ProgressBar />
          </div>
        </div>
      </div>
    </div>
  );
}
