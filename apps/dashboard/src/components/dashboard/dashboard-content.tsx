import React, { Fragment, useState } from "react";
import { AddWidget } from "./add-widget";
import { QuickWidgets } from "./quick-widgets";
import { RenderIf } from "../shared";
import { WidgetWrapper } from "./widget-wrapper";
import { DashboardWidgets } from "./dashboard-widgets";
import { useAtomValue } from "jotai";
import { activeTabAtom, layoutAtom } from "@/lib/atoms/layoutAtom";

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
  const layout = useAtomValue(layoutAtom);
  const activeLayout = useAtomValue(activeTabAtom);
  const currentLayout = layout[activeLayout.id];

  return (
    <div className="w-full h-full">
      {currentLayout?.widget?.length === 0 ? <Empty /> : <DashboardWidgets />}

      {/* <div className="grid grid-cols-2 gap-3">
        <WidgetWrapper />
        <WidgetWrapper />
      </div> */}
    </div>
  );
}
