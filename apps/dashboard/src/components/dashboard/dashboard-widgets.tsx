import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { layoutAtom, LayoutType, syncOnLayoutChange } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { chartsMap, widgetPropsDefaults } from "@/lib/static";
import { splitWidgetSlug } from "@/lib/utils";
import { settingAtom } from "@/lib/atoms/settingsAtom";
import { gridColAtom } from "@/lib/atoms/utilsAtom";
import { ErrorBoundary } from "react-error-boundary";
import WidgetErrorOverlay from "./widget-error-overlay";
import * as Sentry from "@sentry/nextjs";
import ResizeIndicator from "../widgets/shared/resize-indicator";

const ResponsiveGridLayout = WidthProvider(Responsive);
const availableHandles = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];
interface IProps {
  data: LayoutType;
}

export function DashboardWidgets(props: IProps) {
  const { data } = props;

  const syncLayoutChangeFromAtom = useSetAtom(syncOnLayoutChange);
  const dashboardSetting = useAtomValue(settingAtom);

  const [, setGridCol] = useAtom(gridColAtom);

  const layouts = useAtomValue(layoutAtom);
  const activeTab = useAtomValue(activeTabAtom);
  const currLayoutId = activeTab.layout_id;
  const currLayout = layouts.find((item) => item.id === currLayoutId);

  function handleWgError(error: Error) {
    Sentry.captureException(error);
  }

  return (
    <>
      <ResponsiveGridLayout
        className="layout"
        // layouts={layout}
        breakpoints={{
          xxl: 2000,
          xl: 1700,
          lg: 1200,
          md: 996,
          sm: 768,
          xs: 480,
          xxs: 0,
        }}
        cols={{ xxl: 32, xl: 24, lg: 16, md: 12, sm: 12, xs: 4, xxs: 4 }}
        draggableHandle=".cursor-grab"
        resizeHandles={["se"]}
        // resizeHandles={availableHandles}
        rowHeight={110}
        // isResizable={false}
        margin={[12, 12]}
        onDragStop={(newLayouts) => {
          // Check if the current layout id on active tab is null or undefined
          const syncCondition = dashboardSetting.auto_save || currLayout?.draft;
          syncLayoutChangeFromAtom({
            newLayouts: newLayouts,
            sync: syncCondition,
          });
          // console.log("onLayoutChange", newLayouts);
        }}
        onLayoutChange={(test) => {}}
        onResizeStop={(newLayouts) => {
          const syncCondition = dashboardSetting.auto_save || currLayout?.draft;
          syncLayoutChangeFromAtom({
            newLayouts: newLayouts,
            sync: syncCondition,
          });
        }}
        verticalCompact={!false}
        onBreakpointChange={(newBreakpoint) => {
          setGridCol(newBreakpoint);
        }}
      >
        {data?.widgets.map((layout, index) => {
          const x = layout.meta.x || 0;
          const y = layout.meta.y || 0;

          const dimensionDefault =
            widgetPropsDefaults[splitWidgetSlug(layout.meta.i).slug as keyof typeof widgetPropsDefaults]?.meta;
          const minH = dimensionDefault?.minH || 0;
          const minW = dimensionDefault?.minW || 0;
          const maxH = dimensionDefault?.maxH || 0;
          const maxW = dimensionDefault?.maxW || 0;

          const h = layout?.meta?.h || dimensionDefault?.h;
          const w = layout?.meta?.w || dimensionDefault?.w;

          if (!h || !w) return null;

          // console.log("layout", w, maxW, h, maxH);

          let isResizable = chartsMap[splitWidgetSlug(layout.meta.i).slug as keyof typeof chartsMap]?.isResizable;

          // Check if the widget is not resizable by its res props
          if (w === maxW && h === maxH) {
            isResizable = false;
          }

          return (
            <div key={layout.meta.i} data-grid={{ x, y, w, h, minW, minH, maxH, maxW, isResizable }}>
              {/* <ErrorBoundary FallbackComponent={WidgetErrorOverlay} onError={handleWgError}> */}
                {chartsMap[splitWidgetSlug(layout.meta.i).slug as keyof typeof chartsMap]?.component(layout)}

                {/* resize handler */}
                {isResizable && <ResizeIndicator />}
              {/* </ErrorBoundary> */}
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </>
  );
}
