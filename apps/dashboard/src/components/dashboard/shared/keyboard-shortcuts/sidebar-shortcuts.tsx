import { getGridPosition } from "@/charts/helpers";
import { addWidgetToExistingLayoutAtom, addWidgetToNewLayoutAtom, layoutAtom } from "@/lib/atoms/layoutAtom";
import { settingAtom } from "@/lib/atoms/settingsAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { AppRoutes } from "@/lib/routes";
import { layoutOptionsMap, LayoutOptionType, widgetPropsDefaults } from "@/lib/static";
import { joinWidgetSlug, maxTabsByPlan } from "@/lib/utils";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { track } from "@vercel/analytics";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { v4 as uuidv4 } from "uuid";

const SidebarShortcuts = () => {
  const router = useRouter();

  const layouts = useAtomValue(layoutAtom);
  const activeTab = useAtomValue(activeTabAtom);
  const addWidgetToNewLayout = useSetAtom(addWidgetToNewLayoutAtom);
  const dashboardSetting = useAtomValue(settingAtom);
  const addWidgetToExistingLayout = useSetAtom(addWidgetToExistingLayoutAtom);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { data } = useGetUserPlans();

  const addWidgetToLayout = (widget: any) => {
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

    console.log("syncCondition", newWidget);

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
    track("widget_added", {
      widget: widget.slug,
      planType: data?.planType || "FREE",
    });
  };

  // sidenaav shortcuts
  useHotkeys("metaKey+enter, ctrl+enter", () => {
    router.push(AppRoutes.news.path);
  });

  useHotkeys("metaKey+k, ctrl+k", () => {
    router.push(AppRoutes.dashboard.path);
  });

  useHotkeys("metaKey+x, ctrl+x", () => {
    const widget = layoutOptionsMap.find((item) => item.name === "Price Chart Widget");

    addWidgetToLayout(widget);
  });

  return null;
};

export default SidebarShortcuts;
