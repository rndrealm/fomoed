import { ActiveTabType } from "@/components/shared/profilePopover/sidebar-tabs";
import { atom } from "jotai";

export type ProfilePopoverState = {
  open: boolean;
  activeTab?: ActiveTabType;
};

export const profilePopoverAtom = atom<ProfilePopoverState>({
  open: false,
  activeTab: "Profile",
});
