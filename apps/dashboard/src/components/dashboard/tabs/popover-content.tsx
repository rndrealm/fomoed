import { RenderIf } from "@/components/shared";
import React, { Fragment } from "react";
import { SettingsDropdown } from "../settings-dropdown";
import { LayoutDropdown } from "../layout-dropdown";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { settingAtom, updateSettingAtom } from "@/lib/atoms/settingsAtom";
import { useSyncLayouts } from "@/services/queries/widgets";
import { layoutAtom, layoutChangedAtom, setLayoutDraftFalseAtom } from "@/lib/atoms/layoutAtom";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { Loader } from "../loader";
import { ErrorSave, SaveDraft, Unsaved } from "@/components/icons/icons";

interface IToolbarItem {
  onClick?: () => void;
  label?: string;
  content?: React.JSX.Element;
  icon: React.JSX.Element;
  disabled?: boolean;
}

function ToolbarItem(props: IToolbarItem) {
  const { onClick, label, content, icon, disabled } = props;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="w-full" onClick={onClick} disabled={disabled}>
          <div className="group w-full flex flex-row justify-start gap-3 items-center">
            <div className={cn("group h-5 w-5 flex justify-center items-center")}>{icon}</div>
            {content}
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-[#101010] mr-1">
          <p className="text-xs leading-[1.25] font-semibold text-[#afafaf]">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const PopoverContent = () => {
  const settings = useAtomValue(settingAtom);
  const { mutate, isPending, isError, isSuccess } = useSyncLayouts();
  const layouts = useAtomValue(layoutAtom);
  const activeTab = useAtomValue(activeTabAtom);
  const [layoutChange, setLayoutChange] = useAtom(layoutChangedAtom);
  const setLayoutDraftFalse = useSetAtom(setLayoutDraftFalseAtom);

  const currLayoutId = activeTab.layout_id;
  const currLayout = layouts.find((item) => item.id === currLayoutId);

  console.log("currLayout", currLayout);

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

  return (
    <div className="relative w-full bg-transparent flex flex-col gap-6 justify-between items-center">
      <SettingsDropdown />
      <LayoutDropdown />

      {/* layout saving */}
      <>
        <RenderIf condition={!!currLayout && currLayout?.draft}>
          <ToolbarItem
            content={<h3 className="text-[14px] text-[#c3c3c3]">Save Draft</h3>}
            icon={isPending ? <Loader /> : <SaveDraft />}
            label="Save Draft"
            onClick={() => {
              if (isPending) return;

              handleSaveLayout();
            }}
          />
        </RenderIf>

        <RenderIf condition={!!currLayout && !currLayout?.draft}>
          <Fragment>
            <RenderIf condition={!settings.auto_save && !isError && !layoutChange}>
              <ToolbarItem
                disabled={true}
                icon={isPending ? <Loader /> : <Unsaved />}
                label="Saved"
                onClick={isPending ? () => {} : handleSaveLayout}
              />
            </RenderIf>

            <RenderIf condition={isError || (layoutChange && !settings.auto_save)}>
              <ToolbarItem
                icon={isPending ? <Loader /> : <ErrorSave />}
                label="Save layout changes"
                onClick={isPending ? () => {} : handleSaveLayout}
              />
            </RenderIf>
          </Fragment>
        </RenderIf>
      </>
    </div>
  );
};

export default PopoverContent;
