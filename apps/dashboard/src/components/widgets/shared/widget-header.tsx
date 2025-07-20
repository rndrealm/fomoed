"use client";
import { WidgetDropdownMenu } from "@/components/dashboard/widget-options-menu";
import { Drag } from "@/components/icons/icons";
import { ConfirmationModal } from "@/components/modals";
import { deleteWidgetAtom, LayoutType } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { chartsMap } from "@/lib/static";
import { splitWidgetSlug } from "@/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useState } from "react";
import { motion } from "motion/react";
import StarFilled from "@/components/icons/StarFilled";
import { settingAtom, updateSettingAtom } from "@/lib/atoms/settingsAtom";
import Star from "@/components/icons/Star";

interface IProps {
  widget: LayoutType["widgets"][0];
}

const WidgetHeader = (props: IProps) => {
  const { widget } = props;
  const activeLayout = useAtomValue(activeTabAtom);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteWidget, setDeleteWidget] = useState<LayoutType["widgets"][0]>();
  const deleteWidgetFromAtom = useSetAtom(deleteWidgetAtom);

  const settings = useAtomValue(settingAtom);
  const updateSettings = useSetAtom(updateSettingAtom);

  const widgetSlug = splitWidgetSlug(widget.meta.i).slug;

  return (
    <>
      <div className="col-span-1"></div>
      <button type="button" className="flex justify-center cursor-grab">
        <Drag />
      </button>

      <div className="flex justify-end gap-3">
        <button
          className=""
          onClick={() => {
            const isFavorite = settings.favorite_widgets.includes(widgetSlug);

            let newWidgetArray: string[] = [];

            if (isFavorite) {
              newWidgetArray = settings.favorite_widgets.filter(
                (item) => item !== widgetSlug
              );
            } else {
              newWidgetArray = [...settings.favorite_widgets, widgetSlug];
            }
            updateSettings({
              ...settings,
              favorite_widgets: newWidgetArray,
            });
          }}
        >
          {settings.favorite_widgets.includes(widgetSlug) ? (
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [-30, 30, -15, 15, 0] }}
              transition={{
                duration: 1,
                times: [0, 0.2, 0.4, 0.8, 1],
              }}
            >
              <StarFilled />
            </motion.div>
          ) : (
            <Star />
          )}
        </button>
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
        title={`Delete ${chartsMap[splitWidgetSlug(deleteWidget?.meta.i || "").slug as keyof typeof chartsMap]?.name}?`}
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
