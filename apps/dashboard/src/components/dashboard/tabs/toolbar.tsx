import React, { Fragment, useEffect, useState } from "react";
import {
  AddWidget,
  ErrorSave,
  Saved,
  Settings,
  ToolbarLayout,
  Unsaved,
} from "../../icons/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { NewTabs } from "./new-tab";
import { ModalContainer, RenderIf } from "../../shared";
import { QuickWidgets } from "../quick-widgets";
import { useSyncLayouts } from "@/services/queries/widgets";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  layoutAtom,
  layoutChangedAtom,
  setLayoutDraftFalseAtom,
} from "@/lib/atoms/layoutAtom";
import { activeTabAtom, loadTabsFromApiAtom } from "@/lib/atoms/tabsAtom";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import Loader from "../../shared/loader";
import { LayoutDropdown } from "../layout-dropdown";
import { useReadTabs } from "@/services/queries/tabs";
import { Loader2 } from "lucide-react";
import { SettingsDropdown } from "../settings-dropdown";
import { settingAtom } from "@/lib/atoms/settingsAtom";

interface IToolbarItem {
  onClick?: () => void;
  label?: string;
  icon: React.JSX.Element;
}

function ToolbarItem(props: IToolbarItem) {
  const { onClick, label, icon } = props;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger onClick={onClick}>
          <div className="h-[28px] w-[28px] flex items-center justify-center group">
            {icon}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-[#101010]">
          <p className="text-[#afafaf] text-xs font-semibold leading-[1.25]">
            {label}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Toolbar() {
  const [showWidgetsModal, setShowWidgetsModal] = useState(false);
  const { mutate, isPending, isError, isSuccess } = useSyncLayouts();
  const activeTab = useAtomValue(activeTabAtom);
  const layouts = useAtomValue(layoutAtom);
  const settings = useAtomValue(settingAtom);
  const setLayoutDraftFalse = useSetAtom(setLayoutDraftFalseAtom);
  const [layoutChange, setLayoutChange] = useAtom(layoutChangedAtom);

  const currLayoutId = activeTab.layout_id;
  const currLayout = layouts.find((item) => item.id === currLayoutId);

  const handleSaveLayout = async () => {
    if (isPending) return;
    const currentLayout = layouts.find(
      (layout) => layout.id === activeTab.layout_id
    );
    if (!currentLayout) {
      toast("You don't have any changes to save!", {});
      return;
    }
    if (!currentLayout.widgets.length) {
      toast("You need to add a widget to save your layout.", {});
      return;
    }
    const supabase = createSupabaseBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast("You need to be logged in to save your layout.", {});
      return;
    }
    const formatWidgets = currentLayout.widgets.map((widget) => {
      return {
        ...widget,
      };
    });

    setLayoutDraftFalse({ layoutId: currentLayout.id });

    mutate({
      layoutData: {
        id: currentLayout.id,
        name: activeTab.name,
      },
      widgetData: formatWidgets,
    });
  };

  useEffect(() => {
    if (isSuccess) {
      setLayoutChange(false);
    }
  }, [isSuccess]);

  return (
    <Fragment>
      <div className="flex items-center justify-between gap-4">
        <NewTabs />

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex gap-[6px] items-center w-[102px] h-[32px] bg-[#FF3B10] text-xs font-medium text-white rounded-md justify-center"
            onClick={() => {
              setShowWidgetsModal(true);
            }}
          >
            <AddWidget />
            Add Widget
          </button>
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
          <RenderIf condition={!!currLayout && !currLayout?.draft}>
            <Fragment>
              <RenderIf
                condition={!settings.auto_save && !isError && !layoutChange}
              >
                <ToolbarItem
                  icon={isPending ? <Loader /> : <Unsaved />}
                  label="Save"
                  onClick={isPending ? () => {} : handleSaveLayout}
                />
              </RenderIf>

              <RenderIf
                condition={isError || (layoutChange && !settings.auto_save)}
              >
                <ToolbarItem
                  icon={isPending ? <Loader /> : <ErrorSave />}
                  label="Save"
                  onClick={isPending ? () => {} : handleSaveLayout}
                />
              </RenderIf>
            </Fragment>
          </RenderIf>
          {/* {currLayout && !currLayout?.draft ? (
            <ToolbarItem
              icon={isPending ? <Loader /> : <Unsaved />}
              label="Save"
              onClick={isPending ? () => {} : handleSaveLayout}
            />
          ) : null} */}
          <LayoutDropdown />
          <SettingsDropdown />
        </div>
      </div>

      <ModalContainer
        open={showWidgetsModal}
        handleClose={() => {
          setShowWidgetsModal(false);
        }}
        className="h-full p-0 rounded-2xl"
        title="Add New Widget"
        noHeader
      >
        <QuickWidgets
          handleBack={() => {
            setShowWidgetsModal(false);
          }}
        />
      </ModalContainer>
    </Fragment>
  );
}
