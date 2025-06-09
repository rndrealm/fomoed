"use client";
import React, { Fragment, useState } from "react";
import { Delete, Ellipsis } from "@/components/icons/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteWidgetAtom, LayoutType } from "@/lib/atoms/layoutAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { ConfirmationModal } from "@/components/modals";
import { chartsMap } from "@/lib/static";
import { splitWidgetSlug } from "@/lib/utils";

interface IOptionsDropdown {
  widget: LayoutType["widgets"][0];
}

export function OptionsDropdown(props: IOptionsDropdown) {
  const { widget } = props;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteWidget, setDeleteWidget] = useState<LayoutType["widgets"][0]>();

  const deleteWidgetFromAtom = useSetAtom(deleteWidgetAtom);
  const activeLayout = useAtomValue(activeTabAtom);

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="w-[24px] h-[24px] flex items-center justify-center"
          >
            <Ellipsis />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-[210px] rounded-lg bg-[#090909] border border-[#333]"
          align="end"
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="text-[#D4D4D4] text-[13px] leading-[1.25] p-[10px] font-normal focus:bg-[#171717] focus:text-[#C3C3C3] cursor-pointer w-full flex items-center justify-between"
              onSelect={() => {
                setDeleteWidget(widget);
                setShowDeleteModal(true);
              }}
            >
              Delete widget
              <Delete fill="#A2A2A2" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationModal
        handleCloseModal={() => {
          setDeleteWidget(undefined);
          setShowDeleteModal(false);
        }}
        open={showDeleteModal}
        title={`Delete ${chartsMap[splitWidgetSlug(deleteWidget?.meta?.i || "").slug as keyof typeof chartsMap]?.name || ""}?`}
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
    </Fragment>
  );
}
