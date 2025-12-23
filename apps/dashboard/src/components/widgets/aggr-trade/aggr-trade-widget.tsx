"use client";
import React from "react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { WidgetWrapper } from "../shared";

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function AggrTradeWidget(props: IProps) {
  const { widget } = props;

  // Use root URL to let aggr auto-generate unique workspace for each user
  const aggrUrl = process.env.NEXT_PUBLIC_AGGR_URL || "https://aggr.fomoed.app";

  return (
    <WidgetWrapper title="AGGR.TRADE" widget={widget}>
      <div className="w-full h-full flex flex-col">
        <div className="flex-1">
          <iframe
            width="100%"
            height="100%"
            src={aggrUrl}
            title="aggr.trade chart"
            frameBorder="0"
            allow="autoplay; fullscreen"
            className="w-full h-full"
          />
        </div>
      </div>
    </WidgetWrapper>
  );
}
