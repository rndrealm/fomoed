import { getGridPosition } from "@/charts/helpers";
import { activeTabAtom, layoutAtom } from "@/lib/atoms/layoutAtom";
import { LayoutOptionType } from "@/lib/static";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Image from "next/image";
import React from "react";

interface IProps {
  widget: LayoutOptionType[0];
  handleGoBack: () => void;
}

export function QuickWidgetItem(props: IProps) {
  const { widget, handleGoBack } = props;
  const [layouts, setLayout] = useAtom(layoutAtom);
  const activeLayout = useAtomValue(activeTabAtom);
  return (
    <button
      className="flex flex-col gap-x-[6px] gap-y-[6px] cursor-pointer"
      onClick={() => {
        const currLayout = layouts[activeLayout.id];
        const { x, y } = getGridPosition(currLayout.widget.length);

        const newWwidget = {
          i: widget.slug,
          x,
          y,
          w: 3,
          h: 2,
        };

        handleGoBack();
        setLayout((prev) => ({
          ...prev,
          [activeLayout.id]: {
            widget: [...prev?.[activeLayout.id].widget, newWwidget],
          },
        }));
        handleGoBack();
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
