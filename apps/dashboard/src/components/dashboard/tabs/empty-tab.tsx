import React from "react";
import { activeTabAtom, syncActiveTabAtom } from "@/lib/atoms/layoutAtom";
import { useAtomValue, useSetAtom } from "jotai";

export function EmptyTab() {
  const setSyncedActiveTab = useSetAtom(syncActiveTabAtom);
  const activeTab = useAtomValue(activeTabAtom);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-5 ">
      <div className="max-w-[256px] flex flex-col items-center justify-center gap-5">
        <div className="flex flex-col items-center gap-2">
          <p
            // className="text-base text-center text-white"
            className="font-normal text-base leading-[1.43] text-center text-white"
          >
            Wow, it’s so empty here...
          </p>
          <p className="font-normal text-sm leading-[1.43] text-center text-[#b8bcbc]">
            Enter the edit mode and start adding widgets!
          </p>
        </div>

        <div className="flex justify-center">
          <button
            className="font-medium text-xs leading-[1.5] text-white bg-[#3F4143] w-[151px] h-[32px] rounded-sm"
            type="button"
            onClick={() => {
              setSyncedActiveTab({ ...activeTab });
            }}
          >
            Enter edit mode
          </button>
        </div>
      </div>
    </div>
  );
}
