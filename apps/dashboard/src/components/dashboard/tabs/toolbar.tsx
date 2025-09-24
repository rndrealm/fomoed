import React, { Fragment, useEffect, useState } from "react";
import { AddTab } from "../../icons/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
// import mixpanel from "mixpanel-browser";
import { NewTabs } from "./new-tab";
import { ModalContainer, RenderIf } from "../../shared";
import { QuickWidgets } from "../quick-widgets";
import { useSyncLayouts } from "@/services/queries/widgets";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { layoutAtom, layoutChangedAtom, setLayoutDraftFalseAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom, loadTabsFromApiAtom } from "@/lib/atoms/tabsAtom";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";

import { profilePopoverAtom } from "@/lib/atoms/profilePopover";
import { settingAtom } from "@/lib/atoms/settingsAtom";
import { NameLayout, Upgrade } from "@/components/modals";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { cn, maxTabsByPlan } from "@/lib/utils";

import { quickWidgetsVisibleAtom, toggleQuickWidgetsAtom } from "@/lib/atoms/shortcuts";
import { WidgetsPreview } from "../widgets-preview";
import useSubscription from "@/hooks/subscription";
import AddIcon from "@/components/icons/AddIcon";
import { AnimatePresence } from "motion/react";
import MenuPopover from "./menu-popover";

interface IToolbarItem {
  onClick?: () => void;
  label?: string;
  icon: React.JSX.Element;
  disabled?: boolean;
}

function ToolbarItem(props: IToolbarItem) {
  const { onClick, label, icon, disabled } = props;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger onClick={onClick} disabled={disabled}>
          <div className={cn("group flex h-[28px] w-[28px] items-center justify-center")}>{icon}</div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-[#101010]">
          <p className="text-xs leading-[1.25] font-semibold text-[#afafaf]">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Toolbar() {
  // const [showWidgetsModal, setShowWidgetsModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState("");

  const profilePopover = useAtomValue(profilePopoverAtom);
  const setProfilePopoverAtom = useSetAtom(profilePopoverAtom);

  const { mutate, isPending, isError, isSuccess } = useSyncLayouts();
  const { data } = useGetUserPlans();
  const { activePlan } = useSubscription();

  const activeTab = useAtomValue(activeTabAtom);
  const layouts = useAtomValue(layoutAtom);
  const settings = useAtomValue(settingAtom);
  const setLayoutDraftFalse = useSetAtom(setLayoutDraftFalseAtom);
  const [layoutChange, setLayoutChange] = useAtom(layoutChangedAtom);
  const setShowWidgetsModal = useSetAtom(toggleQuickWidgetsAtom);
  const showWidgetsModal = useAtomValue(quickWidgetsVisibleAtom);

  const currLayoutId = activeTab.layout_id;
  const currLayout = layouts.find((item) => item.id === currLayoutId);

  const handleSaveLayout = async () => {
    if (isPending) return;
    const currentLayout = layouts.find((layout) => layout.id === activeTab.layout_id);
    if (!currentLayout) {
      toast("You don't have any changes to save!", {});
      return;
    }
    if (!currentLayout.widgets.length) {
      toast("You need to add a widget to save your layout.", {});
      return;
    }

    //CHECK IF PRO USER
    const planType = data?.hasActivePlans || "FREE"; // Default to FREE if not set
    const maxTabs = maxTabsByPlan[planType] || 3;
    const savedLayouts = layouts.filter((item) => !item.draft);

    if (savedLayouts.length >= maxTabs - 1 && currentLayout.draft) {
      setShowUpgradeModal(true);
      return;
    }

    if (currentLayout.name === "" && newLayoutName === "") {
      setShowNameModal(true);

      return;
    }

    // const supabase = createSupabaseBrowserClient();

    // const {
    //   data: { user },
    // } = await supabase.auth.getUser();
    // if (!user) {
    //   toast("You need to be logged in to save your layout.", {});
    //   return;
    // }
    const formatWidgets = currentLayout.widgets.map((widget) => {
      return {
        ...widget,
      };
    });

    setLayoutDraftFalse({ layoutId: currentLayout.id, name: newLayoutName });

    mutate({
      layoutData: {
        id: currentLayout.id,
        name: currentLayout?.name || newLayoutName,
      },
      widgetData: formatWidgets,
    });
  };

  useEffect(() => {
    if (isSuccess) {
      setLayoutChange(false);
    }
  }, [isSuccess, setLayoutChange]);

  return (
    <Fragment>
      <div className="max-h-[63px] flex items-center justify-end gap-6 md:justify-between">
        <NewTabs />

        <div className="flex items-center gap-[6px] sm:gap-2">
          {/* <button
            type="button"
            id="first-step"
            className="flex h-[32px] w-[102px] items-center justify-center gap-[6px] rounded-md bg-[#FF3B10] text-xs font-medium text-white"
            onClick={() => {
              setShowWidgetsModal(true);
              // mixpanel.track("Preview Open", {
              //   from: "toolbar",
              // });
            }}
          >
            <AddWidget />
            Add Widget
          </button> */}
          {/* <div className="flex items-center gap-[2px]">
            <div className="h-[28px] w-[28px] flex items-center justify-center bg-[#191919] rounded-md">
              <Saved active />
            </div>
            <button
              className="h-[28px] w-[28px] flex items-center justify-center bg-[#0d0d0d] rounded-md"
              onClick={handleSaveLayout}
            >
              {isPending ? <Loader /> : <Unsaved />}
            </button>
          </div> */}

          <div className="flex items-center justify-center gap-0">
            <button
              onClick={() => {
                setShowWidgetsModal(true);
              }}
              className="bg-[#fff] border-[1px] border-[#181818] rounded-[6px] h-8 md:h-10 w-8 md:w-10 flex items-center justify-center"
            >
              <AddTab fill="#000" />
            </button>

            <div className="h-10 w-10 flex items-center justify-center ">
              {/* <NotiSvg /> */}
              <BellIcon
                onClick={() => {
                  // setProfilePopoverAtom({ open: true, activeTab: "Notifications" })
                }}
                className="cursor-not-allowed scale-[0.5714]"
              />
            </div>

            {/* menu with popover */}
            <MenuPopover />
          </div>
        </div>
      </div>

      {/* <ModalContainer
        open={showWidgetsModal}
        handleClose={() => {
          setShowWidgetsModal(false);
        }}
        className="!sm:w-[100%] !xl:max-w-[1300px] h-[90%] max-h-[90%] !w-[100%] !max-w-[95%] rounded-2xl p-0"
        title="Add New Widget"
        noHeader
      >
        <WidgetsPreview
          handleClose={() => {
            setShowWidgetsModal(false);
          }}
        />
      </ModalContainer> */}

      <ModalContainer
        open={showWidgetsModal}
        handleClose={() => {
          setShowWidgetsModal(false);
        }}
        className="!max-w-full !max-h-[120vh] w-[87.5%] sm:w-[520px] md:w-[680px] lg:w-[740px] xl:w-[1100px] 2xl:w-[1300px] h-full p-0 top-[calc(50%+100px)] bg-transparent"
        title="Add New Widget"
        noHeader
        bgBlur={false}
      >
        <QuickWidgets
          handleBack={() => {
            setShowWidgetsModal(false);
          }}
        />
      </ModalContainer>

      <NameLayout
        open={showNameModal}
        handleCloseModal={() => {
          setShowNameModal(false);
        }}
        value={newLayoutName}
        onChange={(name) => {
          setNewLayoutName(name);
        }}
        handleSave={() => {
          if (newLayoutName.trim() === "") return;

          handleSaveLayout();
          setNewLayoutName("");
          setShowNameModal(false);
        }}
        title="Name Layout"
        details="Create a name for your Layout?"
        placeholder="Layout Name"
      />

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
    </Fragment>
  );
}

const NotiSvg = () => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.17263 15.3084C5.07832 15.3084 4.99818 15.2768 4.93221 15.2136C4.86624 15.1504 4.83325 15.0721 4.83325 14.9788C4.83325 14.8854 4.8652 14.8059 4.92909 14.7402C4.99297 14.6745 5.07214 14.6417 5.16659 14.6417H5.51284V8.87253C5.51284 7.72822 5.88165 6.73246 6.61929 5.88523C7.35707 5.03801 8.2895 4.54072 9.41659 4.39336V3.41732C9.41659 3.25523 9.47311 3.11753 9.58617 3.00419C9.69922 2.89072 9.83652 2.83398 9.99804 2.83398C10.1596 2.83398 10.2975 2.89072 10.4118 3.00419C10.5261 3.11753 10.5833 3.25523 10.5833 3.41732V4.39336C11.7103 4.54072 12.6428 5.03801 13.3805 5.88523C14.1182 6.73246 14.487 7.72822 14.487 8.87253V14.6417H14.8333C14.9277 14.6417 15.0069 14.6733 15.0708 14.7365C15.1346 14.7995 15.1666 14.8778 15.1666 14.9713C15.1666 15.0646 15.1347 15.1441 15.071 15.2098C15.0071 15.2755 14.928 15.3084 14.8337 15.3084H5.17263ZM9.99263 17.4877C9.66624 17.4877 9.38929 17.3722 9.16179 17.1413C8.93415 16.9103 8.82034 16.6327 8.82034 16.3084H11.1795C11.1795 16.6396 11.0633 16.919 10.8308 17.1465C10.5984 17.374 10.319 17.4877 9.99263 17.4877ZM6.1795 14.6417H13.8203V8.87253C13.8203 7.80405 13.4507 6.90017 12.7114 6.16086C11.9721 5.42155 11.0683 5.0519 9.99992 5.0519C8.93159 5.0519 8.02777 5.42155 7.28846 6.16086C6.54915 6.90017 6.1795 7.80405 6.1795 8.87253V14.6417Z"
        fill="white"
      />
    </svg>
  );
};

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface BellIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface BellIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const svgVariants: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: [0, -10, 10, -10, 0] },
};

const BellIcon = forwardRef<BellIconHandle, BellIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) {
          controls.start("animate");
        } else {
          onMouseEnter?.(e);
        }
      },
      [controls, onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) {
          controls.start("normal");
        } else {
          onMouseLeave?.(e);
        }
      },
      [controls, onMouseLeave],
    );
    return (
      <div className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={svgVariants}
          animate={controls}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </motion.svg>
      </div>
    );
  },
);

BellIcon.displayName = "BellIcon";
