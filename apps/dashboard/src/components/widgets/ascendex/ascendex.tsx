import React from "react";
import { WidgetWrapper } from "../shared";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { Header } from "./header";

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function Ascendex(props: IProps) {
  const { widget } = props;

  return (
    <div className="h-full w-full bg-[#000]">
      <Header />
      <p className="text-white">HELLO FROM ASCENDEX</p>
    </div>
  );
}
