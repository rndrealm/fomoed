import React, { Fragment } from "react";
import { NavActionButton } from "./nav-action-button";
import SaveIcon from "../icons/SaveIcon";
import { activeTabAtom, syncActiveTabAtom } from "@/lib/atoms/layoutAtom";
import { useAtomValue, useSetAtom } from "jotai";

export function SaveChangesBtn() {
  const setSyncedActiveTab = useSetAtom(syncActiveTabAtom);
  const activeTab = useAtomValue(activeTabAtom);

  return (
    <Fragment>
      <button
        type="button"
        onClick={() => {
          setSyncedActiveTab({ ...activeTab });
        }}
      >
        <NavActionButton label="Save Changes" leftIcon={<SaveIcon />} />
      </button>
    </Fragment>
  );
}
