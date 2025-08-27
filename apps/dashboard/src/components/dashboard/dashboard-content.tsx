"use client";
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
          from="dashboard-empty"
        />
      </RenderIf>

      <ModalContainer
        open={showWidgets}
        handleClose={() => {
          setShowWidgets(false);
        }}
        className="!max-w-full !max-h-[120vh] w-[87.5%] sm:w-[520px] md:w-[680px] lg:w-[740px] xl:w-[1100px] 2xl:w-[1300px] h-full p-0 top-[calc(50%+100px)] bg-transparent"
        title="Add New Widget"
        noHeader
        bgBlur={false}
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
          (layout) => layout.id === item.layout_id,
        );

        return (
          <div
            key={item.id}
            className={cn(
              "h-full w-full",
              isActive ? "" : "invisible h-0 overflow-hidden",
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
