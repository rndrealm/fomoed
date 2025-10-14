import { CoinStats, ExchangeIcon, Question, Summary } from "@/components/icons/icons";
import { cn, splitWidgetSlug } from "@/lib/utils";
import React, { ReactNode, useState } from "react"; // <-- Import useState
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
import { ChevronDown, Maximize2 } from "lucide-react";

// --- Placeholder Icons (Replace with your actual icon components) ---
const AscendexLogo = () => (
  <Image
    src={dashboard.ascendexLogo} // make sure you have this image file
    alt="AscendEX Logo"
    width={108}
    height={16}
    className="object-contain"
    priority
  />
);

const FullScreenIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);
const ThreeDotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);
// --------------------------------------------------------------------

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
  isAscendex?: boolean;
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
    isAscendex = false,
  } = props;

  const settings = useAtomValue(settingAtom);
  const updateSettings = useSetAtom(updateSettingAtom);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const widgetSlug = splitWidgetSlug(widget.meta.i).slug;

  return (
    <div className="relative flex h-full w-full justify-center items-center">
      {/* resize thing */}
      {/* {isResizeIndicator && <ResizeIndicator />} */}

      {/* widget data */}
      <div
        className={cn(
          "relative flex h-full w-full flex-col gap-2 overflow-hidden rounded-2xl",
          isAscendex ? "px-0 pb-0 bg-[#000]" : "bg-[#000] px-2 pt-0 pb-2 sm:px-4 sm:pb-4",
          className,
        )}
      >
        <div className={cn("flex flex-col gap-1", isAscendex && "bg-[#121317]", headerClassName)}>
          <RenderIf condition={!isAscendex}>
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
          </RenderIf>

          {/* == CONDITIONAL RENDER FOR ASCENDEX HEADER == */}
          <RenderIf condition={isAscendex}>
            <div className="flex items-center justify-between w-full h-[62px] px-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-8">
                  <AscendexLogo />
                  <nav className="hidden sm:flex items-center text-sm text-[#9CA3AF]">
                    {["Futures", "Spot", "Lend"].map((label) => (
                      <a
                        key={label}
                        href="#"
                        className="px-[12px] py-[4px] rounded-[6px] hover:text-white transition-colors"
                      >
                        {label}
                      </a>
                    ))}

                    <a
                      href="#"
                      className="px-[12px] py-[4px] rounded-[6px] hover:text-white transition-colors flex items-center gap-[4px]"
                    >
                      Conditional
                      <ChevronDown size={12} strokeWidth={2} />
                    </a>
                  </nav>
                </div>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 flex cursor-grab justify-center">
                <div className="h-[5px] w-[36px] rounded-[2px] bg-[#444]" />
              </div>

              {/* Right: Controls */}
              <div className="flex items-center gap-3">
                {/* Deposit button */}
                <button
                  className="flex items-center justify-center bg-[rgba(118,55,186,0.2)] text-[#7637BA] 
               font-inter font-semibold text-[12px] leading-[14px] 
               px-[12px] py-[9px] rounded-[8px] hover:bg-[rgba(118,55,186,0.3)] 
               transition-colors"
                >
                  Deposit
                </button>

                {/* Settings icon */}
                <button className="text-[#A6AEB2] hover:text-white transition-colors">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path
                      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 
        2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 
        1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 
        1.51V21a2 2 0 0 1-2 2 2 2 0 0 
        1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 
        1.65 1.65 0 0 0-1.82.33l-.06.06a2 
        2 0 0 1-2.83 0 2 2 0 0 
        1 0-2.83l.06-.06a1.65 1.65 
        0 0 0 .33-1.82 1.65 1.65 
        0 0 0-1.51-1H3a2 2 0 0 
        1-2-2 2 2 0 0 1 2-2h.09a1.65 
        1.65 0 0 0 1.51-1 1.65 1.65 
        0 0 0-.33-1.82l-.06-.06a2 
        2 0 0 1 0-2.83 2 2 0 0 
        1 2.83 0l.06.06a1.65 1.65 
        0 0 0 1.82.33H9a1.65 1.65 
        0 0 0 1-1.51V3a2 2 0 0 
        1 2-2 2 2 0 0 1 2 2v.09a1.65 
        1.65 0 0 0 1 1.51 1.65 1.65 
        0 0 0 1.82-.33l.06-.06a2 
        2 0 0 1 2.83 0 2 2 0 0 
        1 0 2.83l-.06.06a1.65 1.65 
        0 0 0-.33 1.82V9c0 .66.26 
        1.3.73 1.77.47.47 1.11.73 
        1.77.73h.09a2 2 0 0 1 
        2 2 2 2 0 0 1-2 2h-.09a1.65 
        1.65 0 0 0-1.51 1z"
                    />
                  </svg>
                </button>

                {/* 3 dots */}
                <div className="flex items-center justify-center">
                  <OptionsDropdown widget={widget} />
                </div>

                {/* Fullscreen icon */}
                <div className="flex items-center justify-center w-6 h-6 rounded-[4px] border border-[#2A2B2E] bg-[#1C1D21]">
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <Maximize2 className="h-[16px] w-[16px] text-[#A6AEB2]" />
                  </button>
                </div>
              </div>
            </div>
          </RenderIf>
        </div>
        {children}
      </div>
    </div>
  );
}
