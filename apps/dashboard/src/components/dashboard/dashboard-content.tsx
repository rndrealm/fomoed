import React, { Fragment, useState } from "react";
import { AddWidget } from "./add-widget";
import { QuickWidgets } from "./quick-widgets";
import { RenderIf } from "../shared";
import { WidgetWrapper } from "./widget-wrapper";

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
  return (
    <div className="w-full h-full p-4">
      <Empty />
      <div className="grid grid-cols-2 gap-3">
        {/* <WidgetWrapper />
        <WidgetWrapper /> */}
      </div>
    </div>
  );
}
