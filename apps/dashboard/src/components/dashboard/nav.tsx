import React, { Fragment, useState } from "react";
import { SelectLayoutBtn } from "./select-layout-btn";
import { AddTab } from "./add-tab";
import { Tabs } from "./tabs";
import { NewWidgetBtn } from "./new-widget-btn";
import { ModalContainer, RenderIf } from "../shared";
import { AddTabModal } from "./add-tab-modal";
import { useAtom } from "jotai";
import { activeTabAtom } from "@/lib/atoms/layoutAtom";
import { SaveChangesBtn } from "./save-changes-btn";
import { EditLayoutBtn } from "./edit-layout-btn";

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
        <div className="flex gap-2 items-center">
          <NewWidgetBtn />

          <RenderIf condition={!activeTab.editMode}>
            <EditLayoutBtn />
            <SelectLayoutBtn />
          </RenderIf>

          <RenderIf condition={activeTab.editMode}>
            <SaveChangesBtn />
          </RenderIf>
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
