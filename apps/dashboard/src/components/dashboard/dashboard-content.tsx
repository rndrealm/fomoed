import React, { Fragment, useState } from "react";
import { AddWidget } from "./add-widget";
import { QuickWidgets } from "./quick-widgets";
import { RenderIf } from "../shared";
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

      <RenderIf condition={showWidgets}>
        <QuickWidgets
          handleBack={() => {
            setShowWidgets(false);
          }}
        />
      </RenderIf>
    </Fragment>
  );
}

export function DashboardContent() {
  const layouts = useAtomValue(layoutAtom);
  const tabs = useAtomValue(tabsAtom);
  const activeLayout = useAtomValue(activeTabAtom);
  console.log("layouts", layouts);
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

      {/* <div className="grid grid-cols-2 gap-3">
        <WidgetWrapper />
        <WidgetWrapper />
      </div> */}
    </div>
  );
}
