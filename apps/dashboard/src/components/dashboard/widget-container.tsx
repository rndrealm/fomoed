import React, { Fragment, useState } from "react";
import { useAtomValue } from "jotai";
import { Responsive, WidthProvider } from "react-grid-layout";
import { activeTabAtom, widgetsAtom } from "@/lib/atoms/layoutAtom";
import { cn } from "@/lib/utils";
import { WidgetPlaceholder } from "./widget-placeholder";
import { EmptyTab } from "./tabs/empty-tab";
import { ModalContainer, RenderIf } from "../shared";
import { AddWidgetModal } from "./add-widget-modal";

function getGridPosition(count: number) {
  const x = count % 2 === 0 ? 0 : 3;
  const y = Math.floor(count / 2) * 2;
  return { x, y };
}

interface ITempWidget {
  name?: string;
}

function TempWidget(props: ITempWidget) {
  const { name } = props;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-base text-center text-white">{name}</p>
    </div>
  );
}

const ResponsiveGridLayout = WidthProvider(Responsive);

export function WidgetContainer() {
  const activeTab = useAtomValue(activeTabAtom);
  const widgets = useAtomValue(widgetsAtom);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Fragment>
      <RenderIf
        condition={
          !widgets?.[activeTab.id] || widgets?.[activeTab.id]?.length === 0
        }
      >
        <div className="w-full h-full">
          <EmptyTab />
        </div>
      </RenderIf>

      <div className="overflow-auto">
        <RenderIf condition={!!widgets?.[activeTab.id]}>
          <ResponsiveGridLayout
            className="layout"
            // layouts={layout}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 6, md: 10, sm: 6, xs: 4, xxs: 2 }}
            // isDraggable={activeTab.editMode}
            // isResizable={activeTab.editMode}
          >
            {widgets?.[activeTab.id]?.map((item, index) => {
              const { x, y } = getGridPosition(index);

              return (
                <div
                  key={`${index}`}
                  className={cn(
                    "bg-[#333] w-full h-full flex justify-center items-center"
                  )}
                  data-grid={{ x, y, w: 3, h: 2 }}
                >
                  <TempWidget name={item.name} />
                </div>
              );
            })}

            <div
              key={`${widgets?.[activeTab.id]?.length || 23}`}
              className={cn(
                "bg-[#333] w-full h-full flex justify-center items-center"
              )}
              data-grid={{
                x: getGridPosition(widgets?.[activeTab.id]?.length || 1).x,
                y: getGridPosition(widgets?.[activeTab.id]?.length || 1).y,
                w: 3,
                h: 2,
              }}
            >
              <WidgetPlaceholder
                handleShowModal={() => {
                  setIsModalOpen(true);
                }}
              />
            </div>
          </ResponsiveGridLayout>
        </RenderIf>
      </div>

      <RenderIf condition={!widgets?.[activeTab.id]}>
        <div
          className={cn(
            "bg-[#333] w-full h-full flex justify-center items-center"
          )}
        >
          <WidgetPlaceholder
            handleShowModal={() => {
              setIsModalOpen(true);
            }}
          />
        </div>
      </RenderIf>

      <ModalContainer
        open={isModalOpen}
        handleClose={() => {
          setIsModalOpen(false);
        }}
        className="h-full"
        title="Add New Widget"
      >
        <AddWidgetModal />
      </ModalContainer>
    </Fragment>
  );
}
