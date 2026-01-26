"use client";
import React from "react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { WidgetWrapper } from "../shared";
import App from "./App";

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function NewLiquidationHeatmap(props: IProps) {
  const { widget } = props;

  return (
    <WidgetWrapper title="Liquidation Heatmap" widget={widget}>
      <App />
    </WidgetWrapper>
  );
}