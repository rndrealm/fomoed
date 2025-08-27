import React, { useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PopoverContent from "./popover-content";

const MenuPopover = () => {
  const [isOpen, setIsOpen] = useState(false);

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
                <MenuSvg />
              </div>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-[#101010]">
            <p className="text-[#afafaf] text-xs font-semibold leading-[1.25]">
              Menu
            </p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          className="mt-3 p-0 w-[200px] bg-[#131313] border-[1px] border-[#242424] rounded-[10px] *:
         px-4 py-4 flex flex-col gap-5
          "
          align="end"
        >
          <DropdownMenuLabel className="p-0 w-full ml-[2px] text-start text-xs text-[#838383]">
            Settings and preferences
          </DropdownMenuLabel>

          <DropdownMenuGroup>
            {/* content */}
            <PopoverContent />
            {/*  */}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

export default MenuPopover;

const MenuSvg = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.88031 10.6673C5.69573 10.6673 5.5392 10.6016 5.41073 10.4702C5.28225 10.3388 5.21802 10.1809 5.21802 9.99628C5.21802 9.81169 5.28371 9.65516 5.4151 9.52669C5.54663 9.39822 5.70461 9.33398 5.88906 9.33398C6.07364 9.33398 6.23017 9.39968 6.35864 9.53107C6.48711 9.66246 6.55135 9.82044 6.55135 10.005C6.55135 10.1896 6.48566 10.3461 6.35427 10.4746C6.22288 10.6031 6.06489 10.6673 5.88031 10.6673ZM9.99573 10.6673C9.81114 10.6673 9.65461 10.6016 9.52614 10.4702C9.39767 10.3388 9.33343 10.1809 9.33343 9.99628C9.33343 9.81169 9.39913 9.65516 9.53052 9.52669C9.66191 9.39822 9.81989 9.33398 10.0045 9.33398C10.1891 9.33398 10.3456 9.39968 10.4741 9.53107C10.6025 9.66246 10.6668 9.82044 10.6668 10.005C10.6668 10.1896 10.6011 10.3461 10.4697 10.4746C10.3383 10.6031 10.1803 10.6673 9.99573 10.6673ZM14.1111 10.6673C13.9266 10.6673 13.77 10.6016 13.6416 10.4702C13.5131 10.3388 13.4489 10.1809 13.4489 9.99628C13.4489 9.81169 13.5145 9.65516 13.6459 9.52669C13.7773 9.39822 13.9353 9.33398 14.1199 9.33398C14.3045 9.33398 14.461 9.39968 14.5895 9.53107C14.7179 9.66246 14.7822 9.82044 14.7822 10.005C14.7822 10.1896 14.7165 10.3461 14.5851 10.4746C14.4536 10.6031 14.2956 10.6673 14.1111 10.6673Z"
        fill="#fff"
      />
    </svg>
  );
};
