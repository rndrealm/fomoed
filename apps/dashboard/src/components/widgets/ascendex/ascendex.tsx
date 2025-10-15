"use client";
import React from "react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { cn } from "@/lib/utils";
import AscendexHeader from "./header";

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function Ascendex({ widget }: IProps) {
  return (
    <div className="relative flex h-full w-full justify-center items-center">
      <div
        className={cn(
          "relative flex h-full w-full flex-col gap-2 overflow-hidden rounded-2xl",
          "px-0 pb-0 bg-[#000]",
        )}
      >
        {/* Header */}
        <AscendexHeader widget={widget} />

        {/* Content */}
        <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
          <p className="text-white">HELLO FROM ASCENDEX</p>
        </div>
      </div>
    </div>
  );
}
