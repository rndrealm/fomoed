import React, { Fragment, useState } from "react";
import { AddTab } from "./tabs/add-tab";
import { Tabs } from "./tabs/tabs";
import { NewWidgetBtn } from "./new-widget-btn";
import { ModalContainer } from "../shared";
import { AddTabModal } from "./add-tab-modal";
import { useAtom } from "jotai";
import { activeTabAtom } from "@/lib/atoms/layoutAtom";

export function Nav() {
  const [activeTab] = useAtom(activeTabAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Fragment>
      <div className="flex justify-between p-2 bg-[#171A1C]">
        <div className="flex items-center gap-4">
          <AddTab
            handleAddTab={() => {
              setIsModalOpen(true);
            }}
          />
          <Tabs />
        </div>
        <div className="flex items-center gap-2">
          <NewWidgetBtn />

          {/* <RenderIf condition={!activeTab.editMode}>
            <EditLayoutBtn />
            <SelectLayoutBtn />
          </RenderIf>

          <RenderIf condition={activeTab.editMode}>
            <SaveChangesBtn />
          </RenderIf> */}
        </div>
      </div>
      <ModalContainer
        open={isModalOpen}
        handleClose={() => {
          setIsModalOpen(false);
        }}
        title="Select from your saved layouts..."
        className="h-full"
      >
        <AddTabModal
          handleTabAdded={() => {
            setIsModalOpen(false);
          }}
          newTab
        />
      </ModalContainer>
    </Fragment>
  );
}
