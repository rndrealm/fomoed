"use client";

import { WidgetDropdownMenu } from "@/components/dashboard/widget-options-menu";
import { Drag } from "@/components/icons/icons";
import { ConfirmationModal } from "@/components/modals";
import { deleteWidgetAtom, LayoutType } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { chartsMap } from "@/lib/static";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useState } from "react";

interface IProps {
  widget: LayoutType["widgets"][0];
}

const WidgetHeader = (props: IProps) => {
  const { widget } = props;
  const activeLayout = useAtomValue(activeTabAtom);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteWidget, setDeleteWidget] = useState<LayoutType["widgets"][0]>();
  const deleteWidgetFromAtom = useSetAtom(deleteWidgetAtom);
  return (
    <>
      <div className="col-span-1"></div>
      <button type="button" className="flex justify-center cursor-grab">
        <Drag />
      </button>

      <div className="flex justify-end">
        <WidgetDropdownMenu
          deleteAction={() => {
            setDeleteWidget(widget);
            setShowDeleteModal(true);
          }}
        />
      </div>
      <ConfirmationModal
        handleCloseModal={() => {
          setShowDeleteModal(false);
          setDeleteWidget(undefined);
        }}
        open={showDeleteModal}
        title={`Delete ${chartsMap[deleteWidget?.meta.i as keyof typeof chartsMap]?.name}?`}
        details="You can always add new widgets to your dashboard after widgets are deleted"
        cancelBtnText="Cancel"
        confirmBtnText="Delete Widget"
        handleConfirm={() => {
          if (!deleteWidget) return;
          deleteWidgetFromAtom({
            tabId: activeLayout.id,
            widgetId: deleteWidget.id,
          });
          setDeleteWidget(undefined);
          setShowDeleteModal(false);
        }}
      />
    </>
  );
};

export default WidgetHeader;
