import { getGridPosition } from "@/charts/helpers";
import {
  addWidgetToExistingLayoutAtom,
  addWidgetToNewLayoutAtom,
  layoutAtom,
} from "@/lib/atoms/layoutAtom";
import { settingAtom } from "@/lib/atoms/settingsAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { LayoutOptionType, widgetPropsDefaults } from "@/lib/static";
import { joinWidgetSlug, maxTabsByPlan } from "@/lib/utils";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Image from "next/image";
import React, { Fragment, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ModalContainer } from "../shared";
import { Upgrade } from "../modals";

interface IProps {
  widget: LayoutOptionType[0];
  handleGoBack: () => void;
}

export function QuickWidgetItem(props: IProps) {
  const { widget, handleGoBack } = props;
  const [layouts, setLayout] = useAtom(layoutAtom);
  const activeTab = useAtomValue(activeTabAtom);
  const addWidgetToNewLayout = useSetAtom(addWidgetToNewLayoutAtom);
  const dashboardSetting = useAtomValue(settingAtom);
  const addWidgetToExistingLayout = useSetAtom(addWidgetToExistingLayoutAtom);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { data } = useGetUserPlans();

  return (
    <Fragment>
      <button
        className="flex flex-col gap-x-[6px] gap-y-[6px] cursor-pointer"
        onClick={() => {
          const currLayoutId = activeTab.layout_id;
          const currLayout = layouts.find((item) => item.id === currLayoutId);

          const { x, y } = getGridPosition(currLayout?.widgets.length || 0);
          const newId = uuidv4();
          const widgetDefaults =
            widgetPropsDefaults[
              widget.slug as keyof typeof widgetPropsDefaults
            ];
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
            const planType = data?.planType || "FREE"; // Default to FREE if not set
            const maxTabs = maxTabsByPlan[planType] || 3;
            if (layouts.length >= maxTabs) {
              setShowUpgradeModal(true);
              return;
            }
            addWidgetToNewLayout({ newWidget });
          }
          handleGoBack();
        }}
      >
        <div className=" bg-[#000] rounded-lg border border-[#121212]">
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

      <ModalContainer
        open={showUpgradeModal}
        handleClose={() => {
          setShowUpgradeModal(false);
        }}
        noHeader
        className="!max-w-[410px] !p-0 rounded-[24px]"
      >
        <Upgrade
          plan={data?.planType}
          handleClose={() => {
            setShowUpgradeModal(false);
          }}
        />
      </ModalContainer>
    </Fragment>
  );
}
