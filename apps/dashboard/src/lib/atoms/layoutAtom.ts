import { atom } from "jotai";
import { layoutOptions } from "../static";

export const layoutAtom = atom(layoutOptions[0].options[0]);
