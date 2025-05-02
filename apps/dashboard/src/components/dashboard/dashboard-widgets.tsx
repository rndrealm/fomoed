import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Drag } from "../icons/icons";
import { useAtomValue, useSetAtom } from "jotai";
import {
  activeTabAtom,
  deleteWidgetAtom,
  LayoutType,
  syncOnLayoutChange,
} from "@/lib/atoms/layoutAtom";
import { chartsMap } from "@/lib/static";
import { WidgetDropdownMenu } from "./widget-options-menu";
import { ConfirmationModal } from "../modals";
import { joinWidgetSlug, splitWidgetSlug } from "@/lib/utils";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface IProps {
  data: LayoutType;
}

export function DashboardWidgets(props: IProps) {
  const { data } = props;
  const activeLayout = useAtomValue(activeTabAtom);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteWidget, setDeleteWidget] = useState<LayoutType["widgets"][0]>();
  const deleteWidgetFromAtom = useSetAtom(deleteWidgetAtom);
  const syncLayoutChangeFromAtom = useSetAtom(syncOnLayoutChange);

  return (
    <>
      <ResponsiveGridLayout
        className="layout"
        // layouts={layout}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 6, md: 6, sm: 6, xs: 4, xxs: 2 }}
        draggableHandle=".cursor-grab"
        rowHeight={210}
        isResizable={false}
        margin={[20, 20]}
        onDragStop={(newLayouts) => {
          syncLayoutChangeFromAtom(newLayouts);
          console.log("onLayoutChange", newLayouts);
        }}
        onLayoutChange={(test) => {}}
      >
        {data?.widgets.map((layout, index) => {
          const { x, y, w, h } = layout.meta;

          return (
            <div
              key={layout.meta.i}
              className="bg-[#080808] border border-[#1b1b1b] rounded-2xl overflow-hidden px-6 py-3 flex flex-col gap-4"
              data-grid={{ x, y, w, h }}
            >
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="grid items-center w-full grid-cols-3">
                  <div className="col-span-1"></div>
                  <button
                    type="button"
                    className="flex justify-center cursor-grab"
                  >
                    <Drag />
                  </button>

                  <div className="flex justify-end">
                    <WidgetDropdownMenu
                      deleteAction={() => {
                        setDeleteWidget(layout);
                        setShowDeleteModal(true);
                      }}
                    />
                  </div>
                </div>
                {chartsMap[
                  splitWidgetSlug(layout.meta.i).slug as keyof typeof chartsMap
                ].component(layout)}
              </div>
            </div>
          );
        })}

        {/* <div
        key={`1`}
        className="h-[200px] bg-[gray]"
        data-grid={{ x: 3, y: 0, w: 3, h: 2 }}
        >
        <div className="flex justify-center">
        <button type="button" className="cursor-grab">
        <Drag />
        </button>
        </div>
        </div>
        
        <div
        key={`2`}
        className="h-[200px] bg-[gray]"
        data-grid={{ x: 0, y: 2, w: 3, h: 2 }}
        >
        <div className="flex justify-center">
        <button type="button" className="cursor-grab">
        <Drag />
        </button>
        </div>
        </div> */}
      </ResponsiveGridLayout>
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
}
