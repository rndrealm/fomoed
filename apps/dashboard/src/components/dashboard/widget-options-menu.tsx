import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Delete, ThreeDots } from "../icons/icons";
import { cn } from "@/lib/utils";

interface IProps {
  deleteAction: () => void;
  triggerClassName?: string;
}

export function WidgetDropdownMenu(props: IProps) {
  const { deleteAction, triggerClassName } = props;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            " w-6 h-6  flex items-center justify-center",
            triggerClassName
          )}
        >
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
