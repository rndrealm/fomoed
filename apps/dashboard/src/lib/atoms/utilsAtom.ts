import { atom } from "jotai";

const initialUtils = {
  isFullScreen: false,
};

export const utilsAtom = atom(initialUtils);

export const isSidebarOpenAtom = atom(false);
