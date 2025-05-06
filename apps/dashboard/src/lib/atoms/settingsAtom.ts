import { IDashboardData } from "@/services/queries/home/types";
import { atom } from "jotai";

const initialSetting = {
  id: "",
  auto_save: true,
};

export const settingAtom = atom(initialSetting);

export const updateSettingAtom = atom(
  null,
  (get, set, newSetting: IDashboardData["settings"]) => {
    set(settingAtom, newSetting);
  }
);
