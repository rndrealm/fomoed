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

  const [resetKeys, setResetKeys] = useState<Record<string, number>>({});

  function handleWgError(error: Error, info: React.ErrorInfo) {
    console.error("Widget error:", error, info);
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: info.componentStack,
        },
      },
    });
  }

  function handleResetError(widgetId: string) {
    setResetKeys((prev) => ({
      ...prev,
      [widgetId]: (prev[widgetId] || 0) + 1,
    }));
  }

  return (
    <>
      <ResponsiveGridLayout
        className="layout"
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
        rowHeight={110}
        margin={[12, 12]}
        onDragStop={(newLayouts) => {
          const syncCondition = dashboardSetting.auto_save || currLayout?.draft;
          syncLayoutChangeFromAtom({
            newLayouts: newLayouts,
            sync: syncCondition,
          });
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

          let isResizable = chartsMap[splitWidgetSlug(layout.meta.i).slug as keyof typeof chartsMap]?.isResizable;

          // Check if the widget is not resizable by its res props
          if (w === maxW && h === maxH) {
            isResizable = false;
          }

          const widgetId = layout.meta.i;
          const resetKey = resetKeys[widgetId] || 0;

          return (
            <div key={widgetId} data-grid={{ x, y, w, h, minW, minH, maxH, maxW, isResizable }}>
              <ErrorBoundary
                FallbackComponent={(props) => (
                  <WidgetErrorOverlay
                    {...props}
                    widget = {layout}
                    resetErrorBoundary={() => handleResetError(widgetId)}
                  />
                )}
                onError={handleWgError}
                resetKeys={[resetKey]}
              >
                {chartsMap[splitWidgetSlug(widgetId).slug as keyof typeof chartsMap]?.component(layout)}

                {/* resize handler */}
                {isResizable && <ResizeIndicator />}
              </ErrorBoundary>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </>
  );
}