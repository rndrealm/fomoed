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
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 8, md: 8, sm: 8, xs: 4, xxs: 2 }}
        draggableHandle=".cursor-grab"
        rowHeight={210}
        isResizable={false}
        margin={[20, 20]}
        onDragStop={(newLayouts) => {
          // Check if the current layout id on active tab is null or undefined
          const syncCondition = dashboardSetting.auto_save || currLayout?.draft;
          syncLayoutChangeFromAtom({
            newLayouts: newLayouts,
            sync: syncCondition,
          });
          console.log("onLayoutChange", newLayouts);
        }}
        onLayoutChange={(test) => {}}
      >
        {data?.widgets.map((layout, index) => {
          const { x, y } = layout.meta;
          const dimensionDefault =
            widgetPropsDefaults[
              splitWidgetSlug(layout.meta.i)
                .slug as keyof typeof widgetPropsDefaults
            ]?.meta;
          const { w, h } = dimensionDefault;
          return (
            <div key={layout.meta.i} data-grid={{ x, y, w, h }}>
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
