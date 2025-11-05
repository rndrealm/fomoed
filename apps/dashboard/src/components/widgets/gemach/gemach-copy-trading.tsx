import React from "react";
import { WidgetWrapper } from "../shared";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { Header } from "./header";
import { AccountInfo } from "./account-info";
import Content from "./content";
import { Modals } from "./modals";

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function GemachCopyTrading(props: IProps) {
  const { widget } = props;

  return (
    <WidgetWrapper
      title="Hyperliquid Copy Trading by Gemach"
      widget={widget}
      isGemachCopyTrading
      titleIcon="none"
      headerClassName="gap-0"
      className="!pb-0"
    >
      <div className="flex-1 flex-col pt-2 overflow-hidden h-full w-full flex">
        <div className="flex flex-col gap-3">
          <Header />
          <AccountInfo />
        </div>

        <div className="text-white flex-1 flex flex-col gap-3 pt-4 overflow-hidden relative">
          <Content />
        </div>
      </div>

      <Modals />
    </WidgetWrapper>
  );
}
