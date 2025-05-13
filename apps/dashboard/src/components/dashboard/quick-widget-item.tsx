import { getGridPosition } from "@/charts/helpers";
import dashboard from "@/lib/assets/dashboard";
import {
  addWidgetToExistingLayoutAtom,
  addWidgetToNewLayoutAtom,
  layoutAtom,
} from "@/lib/atoms/layoutAtom";
import { settingAtom } from "@/lib/atoms/settingsAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { LayoutOptionType, widgetPropsDefaults } from "@/lib/static";
import { capitalizeFirst, joinWidgetSlug } from "@/lib/utils";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Image from "next/image";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import { RenderIf } from "../shared";

interface IProps {
  widget: LayoutOptionType[0];
  handleGoBack: () => void;
  tag: string;
}

export function QuickWidgetItem(props: IProps) {
  const { widget, handleGoBack, tag } = props;
  const [layouts, setLayout] = useAtom(layoutAtom);
  const activeTab = useAtomValue(activeTabAtom);
  const addWidgetToNewLayout = useSetAtom(addWidgetToNewLayoutAtom);
  const dashboardSetting = useAtomValue(settingAtom);
  const addWidgetToExistingLayout = useSetAtom(addWidgetToExistingLayoutAtom);

  return (
    <button
      className="flex flex-col gap-x-[6px] gap-y-[6px] cursor-pointer"
      onClick={() => {
        const currLayoutId = activeTab.layout_id;
        const currLayout = layouts.find((item) => item.id === currLayoutId);

        const { x, y } = getGridPosition(currLayout?.widgets.length || 0);
        const newId = uuidv4();
        const widgetDefaults =
          widgetPropsDefaults[widget.slug as keyof typeof widgetPropsDefaults];
        const defaultWAndH = widgetDefaults.meta || { w: 3, h: 2 };
        const newWidget = {
          id: newId,
          props: widgetDefaults,
          meta: {
            i: joinWidgetSlug(newId, widget.slug),
            x,
            y,
            ...defaultWAndH,
          },
        };

        // Check if the current layout id on active tab is null or undefined
        const syncCondition = dashboardSetting.auto_save || currLayout?.draft;

        if (currLayoutId) {
          addWidgetToExistingLayout({
            widget: newWidget,
            layoutId: currLayoutId,
            sync: syncCondition,
          });
        } else {
          addWidgetToNewLayout({ newWidget });
        }
        handleGoBack();
      }}
    >
      <RenderIf condition={widget.category === "charts" && tag !== "charts"}>
        <div className="flex items-center gap-2 mb-2">
          <Image
            src={dashboard.folder}
            width={22}
            height={22}
            alt="Folder Icon"
          />
          <p className="text-xs font-medium text-white">
            {capitalizeFirst(widget.category)}
          </p>
        </div>
      </RenderIf>
      <div className=" bg-[#000] rounded-lg border border-[#121212] flex-grow">
        <Image src={widget.image} alt={widget.name} />
      </div>
      <div className="flex">
        <div className="px-2 py-1 bg-[#141414] rounded-sm">
          <p className="text-xs leading-[1.35] font-medium text-white">
            {widget.name}
          </p>
        </div>
      </div>
    </button>
  );
}
