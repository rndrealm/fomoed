import Image, { StaticImageData } from "next/image";
import React from "react";

interface IProps {
  widget: {
    id: number;
    image: StaticImageData;
    name: string;
  };
}

export function QuickWidgetItem(props: IProps) {
  const { widget } = props;
  return (
    <div className="flex flex-col gap-x-[6px] gap-y-[6px]">
      {/* <div className="aspect-[1315/1000] bg-[#000] rounded-lg border border-[#121212]"> */}
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
    </div>
  );
}
