import { CoinStats, Question, Summary } from "@/components/icons/icons";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";
import { OptionsDropdown } from "./options-dropwdown";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { RenderIf } from "@/components/shared";

interface IProps {
  children: ReactNode;
  className?: string;
  widget: LayoutType["widgets"][0];
  handleLearnMore: () => void;
  title: string;
  titleIcon?: "coinstats" | "summary";
}

export function WidgetWrapper(props: IProps) {
  const {
    children,
    className = "",
    widget,
    handleLearnMore,
    title,
    titleIcon = "coinstats",
  } = props;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 px-2 sm:px-4 pb-2 sm:pb-4 pt-0 rounded-2xl bg-[#000] relative overflow-hidden h-full",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="cursor-grab flex justify-center pt-4 pb-1">
          <div className="w-[36px] h-[5px] bg-[#444] rounded-[2px]"></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <RenderIf condition={titleIcon === "coinstats"}>
              <CoinStats />
            </RenderIf>

            <RenderIf condition={titleIcon === "summary"}>
              <Summary />
            </RenderIf>
            <h4 className="text-base text-[#878787] leading-[1.35] font-semibold">
              {title}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={handleLearnMore}>
              <Question />
            </button>
            <OptionsDropdown widget={widget} />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
