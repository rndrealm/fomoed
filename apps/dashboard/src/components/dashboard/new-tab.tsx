import React, { Fragment, useState } from "react";
import { AddTab, CloseTab, TabLayout } from "../icons/icons";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  activeTabAtom,
  syncActiveTabAtom,
  tabsAtom,
} from "@/lib/atoms/layoutAtom";
import { cn } from "@/lib/utils";
import { ConfirmationModal } from "../modals";
import { RenderIf } from "../shared";

export function NewTabs() {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const setSyncedActiveTab = useSetAtom(syncActiveTabAtom);
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <Fragment>
      <div className="flex gap-2 items-center flex-1 overflow-hidden w-full">
        <button
          type="button"
          className="h-[32px] w-[32px] flex items-center justify-center rounded-md border border-[#121212]"
          onClick={() => {
            const currentTab = {
              id: Date.now(),
              label: "untitled layout",
              name: "Untitled Layout",
              editMode: false,
            };
            setTabs((prev) => {
              return [...prev, currentTab];
            });
            setActiveTab(currentTab);
          }}
        >
          <AddTab />
        </button>

        <div className="h-[18px] w-[1px] bg-[#141414]"></div>

        <div className="flex-1 overflow-x-auto flex gap-2 items-center scrollbar pr-2">
          {tabs.map((item) => {
            const isActive = activeTab.id === item.id;
            return (
              <div key={item.id} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(item);
                  }}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 w-[160px] h-[32px] px-2 rounded-md gap-3 justify-between",
                      isActive ? "bg-[#252525]" : "bg-[#111]"
                    )}
                  >
                    <div className="flex gap-1 items-center">
                      <TabLayout active={isActive} />
                      <p
                        className={cn(
                          "text-xs font-medium flex-1 truncate flex-1",
                          isActive ? "text-white" : "text-[#7a7a7a]"
                        )}
                      >
                        {item.name}
                      </p>
                    </div>

                    <div className="w-[16px] h-[16px]"></div>
                  </div>
                </button>
                <RenderIf condition={tabs.length > 1}>
                  <button
                    type="button"
                    className="absolute right-[8px] top-[50%] translate-y-[-50%]"
                    onClick={() => {
                      setShowDeleteModal(true);
                    }}
                  >
                    <CloseTab />
                  </button>
                </RenderIf>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmationModal
        handleCloseModal={() => {
          setShowDeleteModal(false);
        }}
        open={showDeleteModal}
        title="Delete Exchange liquidation Heat Map?"
        details="You can always add new widgets to your dashboard after widgets are deleted"
      />
    </Fragment>
  );
}
