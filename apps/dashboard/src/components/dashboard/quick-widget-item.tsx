import { layoutAtom } from "@/lib/atoms/layoutAtom";
import { LayoutOptionType } from "@/lib/static";
import { useAtom, useSetAtom } from "jotai";
import Image from "next/image";
import React from "react";

interface IProps {
  widget: LayoutOptionType[0];
}

export function QuickWidgetItem(props: IProps) {
  const { widget } = props;
  const [layout, setLayout] = useAtom(layoutAtom);
  return (
    <button
      className="flex flex-col gap-x-[6px] gap-y-[6px] cursor-pointer"
      onClick={() => {
        const newLayout = {
          i: widget.slug,
          x: (layout.length % 2) * 2, // Ensures x alternates between 0 and 2
          y: Math.floor(layout.length / 2) * 2, // Increments y every 2 items
          w: 2,
          h: 2,
        };
        setLayout((prev) => [...prev, newLayout]);
      }}
    >
      <div className=" bg-[#000] rounded-lg border border-[#121212]">
        <Image src={widget.image} alt={widget.name} />
      </div>
      <div className="flex">
        <div className="px-2 py-1 bg-[#141414] rounded-sm">
          <p className="text-xs leading-[1.35] font-medium text-white">
            {widget.name}
          </p>
        </div>
      </div>
    </button>
  );
}
