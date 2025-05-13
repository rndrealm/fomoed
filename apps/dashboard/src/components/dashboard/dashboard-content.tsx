import React, { Fragment, useState } from "react";
import { AddWidget } from "./add-widget";
import { QuickWidgets } from "./quick-widgets";
import { ModalContainer, RenderIf } from "../shared";
import { DashboardWidgets } from "./dashboard-widgets";
import { useAtomValue } from "jotai";
import { layoutAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom, tabsAtom } from "@/lib/atoms/tabsAtom";
import { cn } from "@/lib/utils";

function Empty() {
  const [showWidgets, setShowWidgets] = useState(false);

  return (
    <Fragment>
      <RenderIf condition={!showWidgets}>
        <AddWidget
          handleAddWidget={() => {
            setShowWidgets(true);
          }}
        />
      </RenderIf>

      <ModalContainer
        open={showWidgets}
        handleClose={() => {
          setShowWidgets(false);
        }}
        className="h-full p-0 rounded-2xl"
        title="Add New Widget"
        noHeader
      >
        <QuickWidgets
          handleBack={() => {
            setShowWidgets(false);
          }}
        />
      </ModalContainer>
    </Fragment>
  );
}

export function DashboardContent() {
  const layouts = useAtomValue(layoutAtom);
  const tabs = useAtomValue(tabsAtom);
  const activeLayout = useAtomValue(activeTabAtom);

  return (
    <div className="w-full h-full">
      {/* {currentLayout?.widget?.length === 0 ? <Empty /> : <DashboardWidgets />} */}
      {tabs.map((item) => {
        const isActive = item.id === activeLayout.id;
        const currLayout = layouts.find(
          (layout) => layout.id === item.layout_id
        );

        return (
          <div
            key={item.id}
            className={cn(
              "h-full w-full",
              isActive ? "" : "invisible h-0 overflow-hidden"
            )}
          >
            {currLayout?.widgets?.length === 0 || !currLayout ? (
              <Empty />
            ) : (
              <DashboardWidgets data={currLayout} />
            )}
          </div>
        );
      })}
    </div>
  );
}
