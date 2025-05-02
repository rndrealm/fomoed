import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Delete, TabLayout, ToolbarLayout } from "../icons/icons";
import { useReadLayouts } from "@/services/queries/widgets";
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import { useSetAtom } from "jotai";
import { syncLayoutOnSelectAtom } from "@/lib/atoms/layoutAtom";
import { RenderIf } from "../shared";

export function LayoutDropdown() {
  const { data } = useReadLayouts();
  const syncLayouts = useSetAtom(syncLayoutOnSelectAtom);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center rounded-sm ">
          <ToolbarLayout />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[17.56rem] mt-2 bg-[#090909] border border-[#141414]"
        align="end"
      >
        <DropdownMenuLabel className="text-[#474747] font-medium text-[10px] p-2 border-b border-[#141414]">
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
                className="text-[#C3C3C3] my-2 text-[13px] font-inter font-medium flex items-center focus:bg-[#0E0E0E] focus:text-[#C3C3C3] cursor-pointer w-full justify-between"
                onClick={() => {
                  syncLayouts(layout);
                }}
              >
                <TabLayout />
                <p className="flex-1">{layout.name}</p>
                {/* <Delete /> */}
              </DropdownMenuItem>
            ))}
          </RenderIf>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
