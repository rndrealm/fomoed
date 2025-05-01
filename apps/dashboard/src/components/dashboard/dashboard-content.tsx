import React, { Fragment, useState } from "react";
import { AddWidget } from "./add-widget";
import { QuickWidgets } from "./quick-widgets";
import { RenderIf } from "../shared";
import { DashboardWidgets } from "./dashboard-widgets";
import { useAtomValue } from "jotai";
import { activeTabAtom, layoutAtom } from "@/lib/atoms/layoutAtom";
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
  const activeLayout = useAtomValue(activeTabAtom);

  return (
    <div className="w-full h-full">
      {/* {currentLayout?.widget?.length === 0 ? <Empty /> : <DashboardWidgets />} */}
      {layouts.map((item) => {
        const isActive = item.id === activeLayout.id;

        return (
          <div
            key={item.id}
            className={cn(
              "h-full w-full",
              isActive ? "" : "invisible h-0 overflow-hidden"
            )}
          >
            {item?.widget?.length === 0 ? (
              <Empty />
            ) : (
              <DashboardWidgets data={item} />
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
