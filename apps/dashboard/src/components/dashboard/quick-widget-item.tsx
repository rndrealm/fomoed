"use client";
import { getGridPosition } from "@/charts/helpers";
import dashboard from "@/lib/assets/dashboard";
import { addWidgetToExistingLayoutAtom, addWidgetToNewLayoutAtom, layoutAtom } from "@/lib/atoms/layoutAtom";
import { settingAtom } from "@/lib/atoms/settingsAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { LayoutOptionType, widgetPropsDefaults } from "@/lib/static";
import { capitalizeFirst, joinWidgetSlug, maxTabsByPlan } from "@/lib/utils";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { useAtomValue, useSetAtom } from "jotai";
import Image from "next/image";
import React, { Fragment, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { RenderIf } from "../shared";
import { ModalContainer } from "../shared";
import { Upgrade } from "../modals";
import { useNextStep } from "nextstepjs";

interface IProps {
  widget: LayoutOptionType[0];
  handleGoBack: () => void;
  tag: string;
}

export function QuickWidgetItem(props: IProps) {
  const { widget, handleGoBack, tag } = props;
  const layouts = useAtomValue(layoutAtom);
  const activeTab = useAtomValue(activeTabAtom);
  const addWidgetToNewLayout = useSetAtom(addWidgetToNewLayoutAtom);
  const dashboardSetting = useAtomValue(settingAtom);
  const addWidgetToExistingLayout = useSetAtom(addWidgetToExistingLayoutAtom);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { data } = useGetUserPlans();

  const tour = useNextStep();

  const isClicked = useRef(false);

  return (
    <Fragment>
      <button
        className="flex cursor-pointer flex-col gap-x-[6px] gap-y-[6px]"
        onClick={() => {
          isClicked.current = true;
          const currLayoutId = activeTab.layout_id;
          const currLayout = layouts.find((item) => item.id === currLayoutId);

          const { x, y } = getGridPosition(currLayout?.widgets.length || 0);
          const newId = uuidv4();
          const widgetDefaults = widgetPropsDefaults[widget.slug as keyof typeof widgetPropsDefaults];
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
          isClicked.current = false;
          if (tour.currentStep === 1) {
            tour.setCurrentStep(tour.currentStep + 1);
          }
        }}
      >
       <RenderIf condition={widget.category === "charts" && tag !== "charts"}>
          <div className="mb-2 flex items-center gap-2">
            <Image src={dashboard.folder} width={22} height={22} alt="Folder Icon" />
            <p className="text-xs font-medium text-white">{capitalizeFirst(widget.category)}</p>
          </div>
        </RenderIf>
        <RenderIf condition={widget.category === "news" && tag !== "news"}>
          <div className="mb-2 flex items-center gap-2">
            <Image src={dashboard.folder} width={22} height={22} alt="Folder Icon" />
            <p className="text-xs font-medium text-white">{capitalizeFirst(widget.category)}</p>
          </div>
        </RenderIf>
        <div className="h-[160px] overflow-hidden rounded-lg border border-[#121212] bg-[#000]">
          <Image src={widget.image} alt={widget.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex">
          <div className="rounded-sm bg-[#141414] px-2 py-1">
            <p className="text-xs leading-[1.35] font-medium text-white">{widget.name}</p>
          </div>
        </div>
      </button>

      <ModalContainer
        open={showUpgradeModal}
        handleClose={() => {
          setShowUpgradeModal(false);
        }}
        noHeader
        className="!max-w-[410px] rounded-[24px] !p-0"
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
