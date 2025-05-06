import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TabLayout, ToolbarLayout } from "../icons/icons";
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import { useSetAtom } from "jotai";
import {
  loadLayoutsFromApiAtom,
  syncLayoutOnSelectAtom,
} from "@/lib/atoms/layoutAtom";
import { RenderIf } from "../shared";
import { useReadLayouts } from "@/services/queries/layouts";
import { useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useState } from "react";

export function LayoutDropdown() {
  const { data, isSuccess } = useReadLayouts();
  const syncLayouts = useSetAtom(syncLayoutOnSelectAtom);

  const [isOpen, setIsOpen] = useState(false);

  const loadLayoutsFromApi = useSetAtom(loadLayoutsFromApiAtom);
  useEffect(() => {
    if (isSuccess && data?.length) {
      loadLayoutsFromApi(data);
    }
  }, [isSuccess]);

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
              <div className="flex items-center justify-center rounded-sm group">
                <ToolbarLayout active={isOpen} />
              </div>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-[#101010]">
            <p className="text-[#afafaf] text-xs font-semibold leading-[1.25]">
              Layouts
            </p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          className="w-[16rem] mt-2 bg-[#090909] border border-[#333]"
          align="end"
        >
          <DropdownMenuLabel className="text-[#646464] font-medium text-[10px] p-2 border-b border-[#333]">
            SAVED LAYOUTS
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <RenderIf condition={!!data && data?.length === 0}>
              <div className="max-w-[149px] mx-auto py-[50px]">
                <p className="text-[#848484] text-center text-xs font-medium">
                  You currently have no saved layout
                </p>
              </div>
            </RenderIf>

            <RenderIf condition={!!data && data?.length > 0}>
              {data?.map((layout, i) => (
                <DropdownMenuItem
                  key={i}
                  className="text-[#C3C3C3] my-2 text-[13px] font-inter font-medium flex items-center focus:bg-[#171717] focus:text-[#C3C3C3] cursor-pointer w-full justify-between"
                  onClick={() => {
                    syncLayouts(layout);
                  }}
                >
                  <TabLayout />
                  <p className="flex-1 truncate">{layout.name}</p>
                  {/* <Delete /> */}
                </DropdownMenuItem>
              ))}
            </RenderIf>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
