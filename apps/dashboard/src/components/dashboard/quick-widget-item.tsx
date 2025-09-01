"use client";
import { getOptimalGridPosition, getGridColumns } from "@/charts/helpers";
import dashboard from "@/lib/assets/dashboard";
import { addWidgetToExistingLayoutAtom, addWidgetToNewLayoutAtom, layoutAtom } from "@/lib/atoms/layoutAtom";
import { settingAtom } from "@/lib/atoms/settingsAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { LayoutOptionType, widgetPropsDefaults } from "@/lib/static";
import { capitalizeFirst, joinWidgetSlug, maxTabsByPlan } from "@/lib/utils";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { useAtomValue, useSetAtom } from "jotai";
// import mixpanel from "mixpanel-browser";
import Image from "next/image";
import React, { Fragment, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { RenderIf } from "../shared";
import { ModalContainer } from "../shared";
import { Upgrade } from "../modals";
import { track } from "@vercel/analytics";
import { gridColAtom } from "@/lib/atoms/utilsAtom";
import useSubscription from "@/hooks/subscription";

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

  const gridCol = useAtomValue(gridColAtom);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { data } = useGetUserPlans();
  const { activePlan } = useSubscription();

  const isClicked = useRef(false);

  const handleWidgetClick = () => {
    isClicked.current = true;
    const currLayoutId = activeTab.layout_id;
    const currLayout = layouts.find((item) => item.id === currLayoutId);

    const newId = uuidv4();
    const widgetDefaults = widgetPropsDefaults[widget.slug as keyof typeof widgetPropsDefaults];
    const defaultWAndH = widgetDefaults.meta || { w: 3, h: 2 };

    // Use the new optimal positioning system
    const gridCols = getGridColumns(gridCol); // Use xl breakpoint as default
    const { x, y } = getOptimalGridPosition(
      currLayout?.widgets || [],
      defaultWAndH,
      gridCols,
      "row-based", // Use optimal strategy for best placement
    );

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
      const planType = data?.hasActivePlans || "FREE"; // Default to FREE if not set
      const maxTabs = maxTabsByPlan[planType] || 3;
      if (layouts.length >= maxTabs) {
        setShowUpgradeModal(true);
        return;
      }
      addWidgetToNewLayout({ newWidget });
    }
    track("widget_added", {
      widget: widget.slug,
      planType: data?.hasActivePlans || "FREE",
    });
    handleGoBack();
    isClicked.current = false;
    // if (tour.currentStep === 1) {
    //   tour.setCurrentStep(tour.currentStep + 1);
    // }
  };

  return (
    <div className="cursor-pointer p-6 h-full w-full flex flex-col justify-start items-start">
      <div
        className="flex flex-col gap-x-[6px] gap-y-[6px]"
        // onClick={() => {
        //   handleWidgetClick();
        // }}
      >
        {/* <RenderIf
          condition={
            (widget.category === "charts" || widget.category === "games") &&
            tag !== "charts"
          }
        >
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
        </RenderIf> */}
        <div className="flex flex-col gap-1 text-start w-full max-w-[100%]">
          <h2 className="text-white text-[14px] font-medium">{widget.name}</h2>
          <p className="text-[#EBEBEB] text-xs font-normal">
            {widget.description
              ? widget.description
              : "Everything you need, in one place. Stay on top of your business. Get your data in the palm of your hand."}
          </p>
        </div>

        {/* <RenderIf condition={widget.category === "news" && tag !== "news"}>
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
        </RenderIf> */}
        <div className="select-none pointer-events-none absolute top-[35%] left-5.5 min-h-fit h-full min-w-fit w-full overflow-hidden rounded-[28px] border border-[#121212] bg-[#000]">
          <div className="relative w-full h-full flex items-start justify-start">
            <Image
              src={widget.image}
              alt={widget.name}
              // width={400}
              // height={400}
              className="object-cover"
            />
          </div>
        </div>
        {/* <div className="flex opacity-0">
          <div className="rounded-sm bg-[#141414] px-2 py-1">
            <p className="text-xs leading-[1.35] font-medium text-white">
              {widget.name}
            </p>
          </div>
        </div> */}
      </div>

      <ModalContainer
        open={showUpgradeModal}
        handleClose={() => {
          setShowUpgradeModal(false);
        }}
        noHeader
        className="!max-w-[410px] rounded-[24px] !p-0"
      >
        <Upgrade
          plan={activePlan}
          handleClose={() => {
            setShowUpgradeModal(false);
          }}
        />
      </ModalContainer>
    </div>
  );
}
