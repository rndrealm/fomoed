import { NewsFeedItem } from "@/services/queries/news/types";
import { atom } from "jotai";
import { generateAudioLink } from "../utils";

export const audioRefAtom = atom<HTMLAudioElement | null>(null);

export const isAudioPlayingAtom = atom<boolean>(false);

export const hasFinishedPlayingAtom = atom(false);

// List of audio URLs
export const audioPlaylistAtom = atom<NewsFeedItem[]>([]);

// Index of currently playing audio
export const currentAudioIndexAtom = atom<number>(0);

export const audioProgressAtom = atom(0); // in seconds
export const audioDurationAtom = atom(0); // in seconds

// Derived atom: current playing URL
export const currentAudioAtom = atom((get) => {
  const playlist = get(audioPlaylistAtom);
  const index = get(currentAudioIndexAtom);
  return playlist[index] ?? null;
});

export const playAudioAtom = atom(null, (get) => {
  const audio = get(audioRefAtom);
  audio?.play();
});

export const pauseAudioAtom = atom(null, (get) => {
  const audio = get(audioRefAtom);
  audio?.pause();
});

// export const setPlaylistAtom = atom(null, async (get, set, newPlaylist: NewsFeedItem[]) => {
//   set(audioPlaylistAtom, newPlaylist);
//   set(currentAudioIndexAtom, 0);

//   if (newPlaylist.length > 0) {
//     set(isAudioPlayingAtom, true);
//     set(hasFinishedPlayingAtom, false);

//     const audio = get(audioRefAtom);
//     if (audio) {
//       audio.src = generateAudioLink(newPlaylist[0]?.id);
//       try {
//         // await audio.play();
//       } catch (e) {
//         console.warn("Playback failed:", e);
//       }
//     }
//   } else {
//     set(isAudioPlayingAtom, false);
//   }
// });

export const setPlaylistAtom = atom(
  null,
  (
    get,
    set,
    {
      playlist,
      startIndex = 0,
    }: {
      playlist: NewsFeedItem[];
      startIndex?: number;
    }
  ) => {
    const currentPlaylist = get(audioPlaylistAtom);
    const audio = get(audioRefAtom);

    const isSamePlaylist =
      currentPlaylist?.length === playlist?.length && currentPlaylist?.every((item, i) => item.id === playlist[i].id);

    if (isSamePlaylist) {
      set(currentAudioIndexAtom, startIndex);
    } else {
      set(audioPlaylistAtom, playlist);
      set(currentAudioIndexAtom, startIndex);

      // Set audio src manually (no autoplay)
      const selectedTrack = playlist[startIndex];
      if (audio && selectedTrack) {
        audio.src = generateAudioLink(selectedTrack.id);
      }
    }

    set(isAudioPlayingAtom, true);
    set(hasFinishedPlayingAtom, false);
  }
);

export const nextTrackAtom = atom(null, (get, set) => {
  const playlist = get(audioPlaylistAtom);
  const index = get(currentAudioIndexAtom);

  if (index < playlist.length - 1) {
    set(currentAudioIndexAtom, index + 1);
    set(hasFinishedPlayingAtom, false);
    set(isAudioPlayingAtom, true); // auto play
  } else {
    set(isAudioPlayingAtom, false);
    set(hasFinishedPlayingAtom, true); // reached end
  }
});

export const prevTrackAtom = atom(null, (get, set) => {
  const index = get(currentAudioIndexAtom);

  if (index > 0) {
    set(currentAudioIndexAtom, index - 1);
    set(hasFinishedPlayingAtom, false);
    set(isAudioPlayingAtom, true); // auto play
  }
});

export const seekAudioAtom = atom(null, (get, _set, seconds: number | "start") => {
  const audio = get(audioRefAtom);
  if (!audio || isNaN(audio.duration)) return;

  if (seconds === "start") {
    audio.currentTime = 0;
    audio.play(); // optional: auto-restart
    return;
  }

  const newTime = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration));
  audio.currentTime = newTime;
});

export const seekAudioByPercentageAtom = atom(null, (get, _set, percentage: number) => {
  const audio = get(audioRefAtom);
  if (!audio || isNaN(audio.duration)) return;

  const newTime = (percentage / 100) * audio.duration;
  audio.currentTime = newTime;
});

export const closeMiniPlayerAtom = atom(null, (get, set) => {
  const audio = get(audioRefAtom);
  if (audio) {
    audio.currentTime = 0;
    audio.pause();
  }
  // set(isAudioPlayingAtom, false);
  set(audioProgressAtom, 0);
  set(audioDurationAtom, 0);
  set(audioPlaylistAtom, []);
  set(currentAudioIndexAtom, 0);
});
