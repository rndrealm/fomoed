import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { NavActionButton } from "./nav-action-button";
import LayoutIcon from "../icons/LayoutIcon";
import CaretDown from "../icons/CaretDown";
import { layoutOptions } from "@/lib/static";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { layoutAtom } from "@/lib/atoms/layoutAtom";

export function SelectLayoutBtn() {
  const [layout, setLayout] = useAtom(layoutAtom);
  const [expanded, setExpanded] = useState(false);

  return (
    <DropdownMenu open={expanded} onOpenChange={setExpanded}>
      <DropdownMenuTrigger>
        <NavActionButton
          label="Saved Layout"
          leftIcon={<LayoutIcon />}
          rightIcon={<CaretDown open={expanded} />}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-[#2C2F31] mt-3 border-0 w-[277px] px-[14px] py-[18px] rounded-md"
      >
        <div className="flex flex-col gap-4">
          <p className="text-white text-xs">SELECT LAYOUT</p>

          <div className="flex flex-col gap-3">
            {layoutOptions.map((item, index) => {
              return (
                <div
                  key={item.id}
                  className={cn("flex gap-3 items-center pb-3", {
                    "border-b border-[#363A3D]":
                      index !== layoutOptions.length - 1,
                  })}
                >
                  <p className="text-xs text-[#CBCBCB] font-medium">
                    {item.id}
                  </p>

                  <div className="flex gap-3 items-center">
                    {item.options.map((icon) => (
                      <button
                        type="button"
                        key={icon.id}
                        onClick={() => {
                          setLayout(icon);
                        }}
                      >
                        {icon.svg({ active: layout.name === icon.name })}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
