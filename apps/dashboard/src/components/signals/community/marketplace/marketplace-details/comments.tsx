import React from "react";
import { ArrowUp, Ellipsis } from "@/components/icons/icons";
import Image from "next/image";
import marketplace from "@/lib/assets/signals/community/marketplace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Comment() {
  return (
    <div className="flex flex-col gap-2 border-b border-[#141414] py-3 ">
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-2">
          <div className="w-[24px] h-[24px]">
            <Image
              src={marketplace.avatar}
              alt="avatar"
              className="w-full h-full"
            />
          </div>

          <div className="flex items-center gap-1">
            <p className="text-[#D4D4D4] font-xs leading-[1.35] tracking-[-0.4%] font-medium">
              Joshjake
            </p>

            <div className="w-[3px] h-[3px] bg-[#737373] rounded-full"></div>

            <p className="text-[#A2A2A2] font-xs leading-[1.35] tracking-[-0.4%]">
              @joshuajake
            </p>

            <div className="w-[3px] h-[3px] bg-[#737373] rounded-full"></div>

            <p className="text-[#A2A2A2] font-xs leading-[1.35] tracking-[-0.4%]">
              2D ago
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-[20px] h-[20px] flex items-center justify-center"
            >
              <Ellipsis />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[#0A0A0A] border border-[#262626] p-1 w-[152px]"
          >
            <DropdownMenuItem className="focus:bg-[#171717] focus:text-[#fafafa]">
              <p className="text-[#FAFAFA] tracking-[-0.4%] leading-[1.35] text-sm">
                Copy Link
              </p>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#171717] focus:text-[#fafafa]">
              <p className="text-[#FAFAFA] tracking-[-0.4%] leading-[1.35] text-sm">
                Report comment
              </p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-[24px] h-[24px] invisible">
          <Image
            src={marketplace.avatar}
            alt="avatar"
            className="w-full h-full"
          />
        </div>

        <p className="text-[#D4D4D4] text-xs leading-[1.35] tracking-[-0.4%] font-medium">
          This smart signal fu*ks!
        </p>
      </div>
    </div>
  );
}
export function Comments() {
  return (
    <div className="flex flex-col gap-4 max-w-[461px] w-full">
      <p className="text-white text-sm leading-[1.35] tracking-[-0.4%] font-medium">
        Comments
      </p>

      <div className="relative h-[80px]">
        <textarea
          className="w-full h-full bg-[#191919] text-white text-xs leading-[1.35] tracking-[-0.4%] p-[10px] rounded-md resize-none placqeholder:text-[#D4D4D4] border border-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[transparent]"
          placeholder="Make a comment"
        ></textarea>
        <button
          type="button"
          className="absolute bottom-[8px] right-[8px] bg-white w-[32px] h-[32px] rounded-full flex items-center justify-center"
        >
          <ArrowUp fill="#000000" />
        </button>
      </div>

      <p className="text-[#D4D4D4] text-xs leading-[1.35] tracking-[-0.4%] font-medium">
        2 Comments
      </p>

      <div className="flex flex-col gap-4">
        <Comment />
        <Comment />
      </div>
    </div>
  );
}
