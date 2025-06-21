import { IDashboardData } from "@/services/queries/home/types";
import {
  updateSettingsAction,
  updateSettingsActiveTab,
} from "@/services/queries/settings/actions";
import { atom } from "jotai";

export const initialSetting: IDashboardData["settings"] = {
  id: "",
  auto_save: true,
  favorite_widgets: [],
};

export const settingAtom = atom(initialSetting);

let currentAbortController: AbortController | null = null;

export const loadSettingsFromApiAtom = atom(
  null,
  (_, set, newSetting: IDashboardData["settings"]) => {
    const formatSettings = {
      ...newSetting,
      auto_save: newSetting.auto_save ?? true,
    };
    set(settingAtom, formatSettings);
  }
);

export const updateSettingAtom = atom(
  null,
  async (_, set, newSetting: IDashboardData["settings"]) => {
    // Abort the previous request if still pending
    if (currentAbortController) {
      currentAbortController.abort();
    }

    // Create a new controller for this request
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;
    const formatSettings = {
      ...newSetting,
      auto_save: newSetting.auto_save ?? true,
    };
    set(settingAtom, formatSettings);

    console.log(newSetting);

    try {
      await updateSettingsAction(newSetting, signal);
    } catch (error) {
      console.log("Failed to sync tabs with DB:", error);
    }
  }
);
