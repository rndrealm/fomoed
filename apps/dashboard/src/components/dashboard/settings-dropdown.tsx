import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { SaveDraft, Settings } from "../icons/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { settingAtom, updateSettingAtom } from "@/lib/atoms/settingsAtom";
import { useSyncLayouts } from "@/services/queries/widgets";
import { layoutAtom, setLayoutDraftFalseAtom } from "@/lib/atoms/layoutAtom";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import Loader from "../shared/loader";
import { RenderIf } from "../shared";

interface IAutoSave {
  autosave: boolean;
}
function AutoSaveToggle(props: IAutoSave) {
  const { autosave } = props;

  return (
    <div className="flex items-center justify-between w-full">
      <p className="flex-1">Autosave layouts</p>

      <div
        className={cn(
          "flex items-center justify-center gap-1 p-[3px] rounded-lg border border-[#232323]",
          autosave ? "bg-[#FF3B10] flex-row-reverse" : "bg-[#141414]"
        )}
      >
        <div
          className={cn(
            "w-[16px] h-[16px] rounded-sm",
            autosave ? "bg-white" : "bg-[#373737]"
          )}
        ></div>
        <p
          className={cn(
            "text-[8px] font-medium w-[16px] text-right",
            autosave ? "text-white" : "text-[#9B9B9B]"
          )}
        >
          {autosave ? "ON" : "OFF"}
        </p>
      </div>
    </div>
  );
}

export function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const settings = useAtomValue(settingAtom);
  const updateSettings = useSetAtom(updateSettingAtom);
  const { mutate, isPending } = useSyncLayouts();
  const layouts = useAtomValue(layoutAtom);
  const activeTab = useAtomValue(activeTabAtom);
  const setLayoutDraftFalse = useSetAtom(setLayoutDraftFalseAtom);

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

  return (
    <TooltipProvider>
      <DropdownMenu
        onOpenChange={(e) => {
          setIsOpen(e);
        }}
      >
        <Tooltip>
          <TooltipTrigger>
            <DropdownMenuTrigger asChild>
              <div className="h-[28px] w-[28px] flex items-center justify-center group">
                <Settings active={isOpen} />
              </div>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-[#101010]">
            <p className="text-[#afafaf] text-xs font-semibold leading-[1.25]">
              Settings
            </p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          className="w-[16rem] mt-2 bg-[#090909] border border-[#333]"
          align="end"
        >
          <DropdownMenuLabel className="text-[#646464] font-medium text-[10px] p-2 border-b border-[#333]">
            SETTINGS
          </DropdownMenuLabel>
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuGroup>
            {currLayout?.draft ? (
              <DropdownMenuItem
                className="text-[#C3C3C3] my-2 text-[13px] font-inter font-medium flex items-center focus:bg-[#171717] focus:text-[#C3C3C3] cursor-pointer w-full justify-between"
                onClick={handleSaveLayout}
                disabled={isPending}
              >
                <SaveDraft />
                <p className="flex-1">Save draft as layout</p>
                <RenderIf condition={isPending}>
                  <Loader className="w-4 h-4" />
                </RenderIf>
              </DropdownMenuItem>
            ) : null}
            {/* <DropdownMenuItem
              className="text-[#C3C3C3] my-2 text-[13px] font-inter font-medium flex items-center focus:bg-[#171717] focus:text-[#C3C3C3] cursor-pointer w-full justify-between"
              onClick={() => {}}
            >
              <Delete fill="#5B5B5B" />
              <p className="flex-1">Delete Draft</p>
            </DropdownMenuItem> */}

            <DropdownMenuItem
              className="text-[#C3C3C3] my-2 text-[13px] font-inter font-medium flex items-center focus:bg-[#171717] focus:text-[#C3C3C3] cursor-pointer w-full justify-between"
              onSelect={(e) => {
                e.preventDefault();
                updateSettings({
                  ...settings,
                  auto_save: !settings.auto_save,
                });
              }}
            >
              <AutoSaveToggle autosave={settings.auto_save} />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
