import React from "react";
import AddIcon from "../icons/AddIcon";
import EditIcon from "../icons/EditIcon";
import { NavActionButton } from "./nav-action-button";
import { SelectLayoutBtn } from "./select-layout-btn";

export function Nav() {
  return (
    <div className="flex justify-between p-2 bg-[#171A1C]">
      <div className="flex items-center gap-4">
        <button type="button">
          <div className="">
            <AddIcon />
          </div>
        </button>

        <button type="button" className="pb-1 border-b border-white">
          <p className="text-white text-xs leading-[150%] font-medium">
            MAIN TAB
          </p>
        </button>
      </div>
      <div className="flex gap-2 items-center">
        <NavActionButton
          label="New Widget"
          leftIcon={<AddIcon stroke="#717A7A" />}
        />
        <NavActionButton label="Edit Layout" leftIcon={<EditIcon />} />
        <SelectLayoutBtn />
      </div>
    </div>
  );
}
