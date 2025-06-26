import {
  CoinStats,
  ExchangeIcon,
  Question,
  Summary,
} from "@/components/icons/icons";
import { cn, splitWidgetSlug } from "@/lib/utils";
import React, { ReactNode } from "react";
import { OptionsDropdown } from "./options-dropwdown";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { RenderIf } from "@/components/shared";
import StarFilled from "@/components/icons/StarFilled";
import { useAtomValue, useSetAtom } from "jotai";
import { settingAtom, updateSettingAtom } from "@/lib/atoms/settingsAtom";
import Star from "@/components/icons/Star";
import { motion } from "motion/react";

interface IProps {
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  widget: LayoutType["widgets"][0];
  handleLearnMore?: () => void;
  title: string;
  titleIcon?: "coinstats" | "summary" | "exchange";
}

export function WidgetWrapper(props: IProps) {
  const {
    children,
    className = "",
    headerClassName = "",
    widget,
    handleLearnMore,
    title,
    titleIcon = "coinstats",
  } = props;

  const settings = useAtomValue(settingAtom);
  const updateSettings = useSetAtom(updateSettingAtom);

  const widgetSlug = splitWidgetSlug(widget.meta.i).slug;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 px-2 sm:px-4 pb-2 sm:pb-4 pt-0 rounded-2xl bg-[#000] relative overflow-hidden h-full",
        className
      )}
    >
      <div className={cn("flex flex-col gap-1", headerClassName)}>
        <div className="flex justify-center pt-4 pb-1 cursor-grab">
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
            <RenderIf condition={titleIcon === "exchange"}>
              <ExchangeIcon />
            </RenderIf>
            <h4 className="text-base text-[#878787] leading-[1.35] font-semibold select-none">
              {title}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const isFavorite =
                  settings.favorite_widgets.includes(widgetSlug);

                let newWidgetArray: string[] = [];

                if (isFavorite) {
                  newWidgetArray = settings.favorite_widgets.filter(
                    (item) => item !== widgetSlug
                  );
                } else {
                  newWidgetArray = [...settings.favorite_widgets, widgetSlug];
                }
                updateSettings({
                  ...settings,
                  favorite_widgets: newWidgetArray,
                });
              }}
            >
              {settings.favorite_widgets.includes(widgetSlug) ? (
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [-30, 30, -15, 15, 0] }}
                  transition={{
                    duration: 1,
                    times: [0, 0.2, 0.4, 0.8, 1],
                  }}
                >
                  <StarFilled />
                </motion.div>
              ) : (
                <Star />
              )}
            </button>
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
