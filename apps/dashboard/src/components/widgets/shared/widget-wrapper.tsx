import { CoinStats, ExchangeIcon, Question, Summary } from "@/components/icons/icons";
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
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import ResizeIndicator from "./resize-indicator";

interface IProps {
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  widget: LayoutType["widgets"][0];
  handleLearnMore?: () => void;
  title: string;
  titleIcon?: "coinstats" | "summary" | "exchange" | "none";
  isDuckGame?: boolean;
  isGemachCopyTrading?: boolean;
  isResizeIndicator?: boolean;
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
    isDuckGame = false,
    isGemachCopyTrading = false,
    isResizeIndicator = true,
  } = props;

  const settings = useAtomValue(settingAtom);
  const updateSettings = useSetAtom(updateSettingAtom);

  const widgetSlug = splitWidgetSlug(widget.meta.i).slug;

  return (
    <div className="relative flex h-full w-full justify-center items-center">
      <div
        className={cn(
          "relative flex h-full w-full flex-col gap-2 overflow-hidden rounded-2xl bg-[#000] px-2 pt-0 pb-2 sm:px-4 sm:pb-4",
          className,
        )}
      >
        <div className={cn("flex flex-col gap-1", headerClassName)}>
          <div className="flex cursor-grab justify-center pt-4 pb-1">
            <div className="h-[5px] w-[36px] rounded-[2px] bg-[#444]"></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <RenderIf condition={isDuckGame}>
                <Image src={dashboard.duckGameIcon} alt="duck game" className="w-[32px] h-[32px] rounded-full" />
              </RenderIf>
              <RenderIf condition={titleIcon === "coinstats"}>
                <CoinStats />
              </RenderIf>

              <RenderIf condition={titleIcon === "summary"}>
                <Summary />
              </RenderIf>
              <RenderIf condition={titleIcon === "exchange"}>
                <ExchangeIcon />
              </RenderIf>
                  <div className="flex flex-col gap-[2px]">
              <h4 className="text-base leading-[1.35] font-semibold text-[#878787] select-none">{title}</h4>
              <RenderIf condition={isGemachCopyTrading}>
                <div className="flex items-center gap-1">
                  <div className="bg-[#2C233A] border border-[#3A2C4F] rounded-sm px-1 py-[2px]">
                    <p className="text-[#C1A8FF] leading-[12px] tracking-[-0.4%] text-[8px]">
                      HYPERLIQUID PERP TRADING
                    </p>
                  </div>
                  <div className="">
                    <Image src={dashboard.hyperliquidLogo} alt="hyperliquid logo" className="w-[14px] h-[14px]" />
                  </div>
                </div>
              </RenderIf>
            </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const isFavorite = settings.favorite_widgets.includes(widgetSlug);
                  let newWidgetArray: string[] = [];
                  if (isFavorite) {
                    newWidgetArray = settings.favorite_widgets.filter((item) => item !== widgetSlug);
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
    </div>
  );
}