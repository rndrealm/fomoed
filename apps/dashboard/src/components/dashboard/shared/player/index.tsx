import React, { Fragment, useEffect, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  audioDurationAtom,
  audioPlaylistAtom,
  audioProgressAtom,
  audioRefAtom,
  currentAudioIndexAtom,
  hasFinishedPlayingAtom,
  isAudioPlayingAtom,
  nextTrackAtom,
} from "@/lib/atoms/audio";
import { generateAudioLink } from "@/lib/utils";
import { MiniPlayer } from "./mini-player";

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const setAudioRef = useSetAtom(audioRefAtom);
  const [isPlaying, setIsPlaying] = useAtom(isAudioPlayingAtom);
  const [currentIndex, setCurrentIndex] = useAtom(currentAudioIndexAtom);
  const playlist = useAtomValue(audioPlaylistAtom);
  const [hasFinishedPlaying, setHasFinishedPlaying] = useAtom(hasFinishedPlayingAtom);
  const nextTrack = useSetAtom(nextTrackAtom);
  const setProgress = useSetAtom(audioProgressAtom);
  const setDuration = useSetAtom(audioDurationAtom);

  // When currentIndex changes, load & play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const src = generateAudioLink(playlist[currentIndex]?.id);
    if (src) {
      audio.src = src;
      audio.load();
      if (!hasFinishedPlaying) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }

    // eslint-disable-next-line
  }, [currentIndex, playlist, hasFinishedPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      setAudioRef(audioRef.current);
    }
  }, [setAudioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      if (currentIndex < playlist.length - 1) {
        // Go to next track

        setCurrentIndex(currentIndex + 1);
      } else {
        // Last track: stop and reset
        setIsPlaying(false);
        setCurrentIndex(0);
        setHasFinishedPlaying(true);
      }
    };

    const handleError = () => {
      console.warn("Error loading track. Skipping to next...");
      nextTrack();
    };

    const updateProgress = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);

    return () => {
      audio?.removeEventListener("play", handlePlay);
      audio?.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);

      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
    };
  }, [
    playlist,
    currentIndex,
    nextTrack,
    setCurrentIndex,
    setDuration,
    setHasFinishedPlaying,
    setIsPlaying,
    setProgress,
  ]);

  return (
    <Fragment>
      <audio ref={audioRef} preload="metadata" className="hidden">
        <source
          src="https://storage.googleapis.com/fomoed_news_summary_audio/-m1GIJNEGBNAs65LOQwtQwaUwczUKXJpSYmMV1HR7pI.mp3"
          type="audio/mpeg"
        />
      </audio>

      <MiniPlayer />
    </Fragment>
  );
}
