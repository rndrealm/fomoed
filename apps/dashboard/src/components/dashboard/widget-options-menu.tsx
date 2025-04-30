import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Delete, ThreeDots } from "../icons/icons";

export function WidgetDropdownMenu({
  deleteAction,
}: {
  deleteAction: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-sm border-[0.5px] border-[#222222] w-6 h-6  flex items-center justify-center">
          <ThreeDots />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-[#090909] border border-[#141414]"
        align="end"
      >
        <DropdownMenuItem
          className="text-[#C3C3C3] text-[13px] font-inter font-medium flex items-center focus:bg-[#0E0E0E] focus:text-[#C3C3C3] cursor-pointer"
          onClick={deleteAction}
        >
          <Delete />
          Delete Widget
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
