import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useAtomValue, useSetAtom } from "jotai";
import {
  layoutAtom,
  LayoutType,
  syncOnLayoutChange,
} from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { chartsMap, widgetPropsDefaults } from "@/lib/static";
import { splitWidgetSlug } from "@/lib/utils";
import { settingAtom } from "@/lib/atoms/settingsAtom";

const ResponsiveGridLayout = WidthProvider(Responsive);
const availableHandles = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];
interface IProps {
  data: LayoutType;
}

export function DashboardWidgets(props: IProps) {
  const { data } = props;

  const syncLayoutChangeFromAtom = useSetAtom(syncOnLayoutChange);
  const dashboardSetting = useAtomValue(settingAtom);

  const layouts = useAtomValue(layoutAtom);
  const activeTab = useAtomValue(activeTabAtom);
  const currLayoutId = activeTab.layout_id;
  const currLayout = layouts.find((item) => item.id === currLayoutId);

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
      >
        {data?.widgets.map((layout, index) => {
          const { x, y } = layout.meta;
          const dimensionDefault =
            widgetPropsDefaults[
              splitWidgetSlug(layout.meta.i)
                .slug as keyof typeof widgetPropsDefaults
            ]?.meta;
          const { w, h, minH, minW, maxH, maxW } = dimensionDefault;
          return (
            <div
              key={layout.meta.i}
              data-grid={{ x, y, w, h, minW, minH, maxH, maxW }}
            >
              {chartsMap[
                splitWidgetSlug(layout.meta.i).slug as keyof typeof chartsMap
              ]?.component(layout)}
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </>
  );
}
