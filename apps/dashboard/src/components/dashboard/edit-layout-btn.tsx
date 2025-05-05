import React from "react";
import { activeTabAtom, syncActiveTabAtom } from "@/lib/atoms/layoutAtom";
import { useAtomValue, useSetAtom } from "jotai";
import EditIcon from "../icons/EditIcon";
import { NavActionButton } from "./nav-action-button";

export function EditLayoutBtn() {
  const setSyncedActiveTab = useSetAtom(syncActiveTabAtom);
  const activeTab = useAtomValue(activeTabAtom);

  return (
    <button
      type="button"
      onClick={() => {
        setSyncedActiveTab({ ...activeTab });
      }}
    >
      <NavActionButton label="Edit Layout" leftIcon={<EditIcon />} />
    </button>
  );
}
