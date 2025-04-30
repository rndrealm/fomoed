import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { WidgetWrapper } from "./widget-wrapper";
import { Drag } from "../icons/icons";
import { useAtomValue } from "jotai";
import { activeTabAtom, layoutAtom } from "@/lib/atoms/layoutAtom";
import { chartsMap } from "@/lib/static";

const ResponsiveGridLayout = WidthProvider(Responsive);

export function DashboardWidgets() {
  const layout = useAtomValue(layoutAtom);
  const activeLayout = useAtomValue(activeTabAtom);
  const currentLayout = layout[activeLayout.id];
  console.log(currentLayout);

  return (
    <ResponsiveGridLayout
      className="layout"
      // layouts={layout}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 6, md: 6, sm: 6, xs: 4, xxs: 2 }}
      draggableHandle=".cursor-grab"
      rowHeight={210}
      isResizable={false}
      margin={[20, 20]}
      onLayoutChange={(test) => {
        // console.log(test);
      }}
    >
      {currentLayout.widget.map((layout, index) => {
        // const { x, y } = getGridPosition(index);

        return (
          <div
            key={`${index}`}
            className="bg-[#080808] border border-[#1b1b1b] rounded-2xl overflow-hidden px-6 py-3 flex flex-col gap-4"
            data-grid={{ x: layout.x, y: layout.y, w: layout.w, h: layout.h }}
          >
            <div className="flex flex-col items-center justify-center w-full h-full">
              <button type="button" className="cursor-grab">
                <Drag />
              </button>
              {chartsMap[layout.i as keyof typeof chartsMap]}
            </div>
          </div>
        );
      })}

      {/* <div
        key={`1`}
        className="h-[200px] bg-[gray]"
        data-grid={{ x: 3, y: 0, w: 3, h: 2 }}
      >
        <div className="flex justify-center">
          <button type="button" className="cursor-grab">
            <Drag />
          </button>
        </div>
      </div>

      <div
        key={`2`}
        className="h-[200px] bg-[gray]"
        data-grid={{ x: 0, y: 2, w: 3, h: 2 }}
      >
        <div className="flex justify-center">
          <button type="button" className="cursor-grab">
            <Drag />
          </button>
        </div>
      </div> */}
    </ResponsiveGridLayout>
  );
}
