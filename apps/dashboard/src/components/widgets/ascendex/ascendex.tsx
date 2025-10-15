import React from "react";
import { WidgetWrapper } from "../shared";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { Header } from "./header";
import CreateOrder from "./create-order";

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function Ascendex(props: IProps) {
  const { widget } = props;

  return (
    <div className="h-full w-full bg-[#000] flex flex-col">
      <Header />
      <div className="flex flex-1">
        <div className="flex-1">
          <p className="text-white">HELLO FROM ASCENDEX</p>
        </div>

        <CreateOrder />
      </div>
    </div>
  );
}
