import { activeTabAtom, layoutAtom, widgetsAtom } from "@/lib/atoms/layoutAtom";
import { layoutClassMap, layoutCountMap } from "@/lib/static";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import React, { Fragment } from "react";
import { WidgetPlaceholder } from "./widget-placeholder";
import { EmptyTab } from "./empty-tab";
import { RenderIf } from "../shared";

const baseClassName = "flex-1 h-full w-full overflow-hidden grid gap-2";

interface ITempWidget {
  name?: string;
}

function TempWidget(props: ITempWidget) {
  const { name } = props;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-center text-base text-white">{name}</p>
    </div>
  );
}

export function WidgetContainer() {
  const layout = useAtomValue(layoutAtom);
  const activeTab = useAtomValue(activeTabAtom);
  const widgets = useAtomValue(widgetsAtom);

  // console.log(layout, activeTab, widgets);

  const paneClassName = layoutClassMap[layout.name];

  return (
    <Fragment>
      <RenderIf
        condition={
          (!widgets?.[activeTab.id] || widgets?.[activeTab.id]?.length === 0) &&
          !activeTab.editMode
        }
      >
        <div className="h-full w-full">
          <EmptyTab />
        </div>
      </RenderIf>
      <div className={cn(baseClassName, paneClassName)}>
        <RenderIf
          condition={
            widgets?.[activeTab.id] && widgets?.[activeTab.id]?.length !== 0
          }
        >
          <Fragment>
            {widgets?.[activeTab.id]?.map((item, index) => {
              return (
                <div
                  key={index}
                  className={cn(
                    "bg-[#333] w-full h-full flex justify-center items-center",
                    index >= layoutCountMap[layout.name] && "hidden"
                  )}
                >
                  <TempWidget name={item.name} />
                </div>
              );
            })}
          </Fragment>
        </RenderIf>

        <RenderIf
          condition={
            activeTab.editMode &&
            layoutCountMap[layout.name] > (widgets?.[activeTab.id]?.length || 0)
          }
        >
          <div className={cn("bg-[#333] w-full h-full")}>
            <WidgetPlaceholder />
          </div>
        </RenderIf>

        {/* <RenderIf condition={activeTab.editMode}>
          {Array(1)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className={cn(
                  "bg-[#333] w-full h-full",
                  index >= layoutCountMap[layout.name] && "hidden"
                )}
              >
                <WidgetPlaceholder />
              </div>
            ))}
        </RenderIf> */}
      </div>
    </Fragment>
  );
}
