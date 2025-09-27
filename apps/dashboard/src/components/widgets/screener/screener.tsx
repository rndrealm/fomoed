"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { WidgetWrapper } from "../shared";
import ScreenerTable from "./screener-table";
import { useFetchCoinStatsToken } from "@/services/queries/charts";
import { cn, formatMarketCapNumber, formatPriceSignificant, modalSlide } from "@/lib/utils";
import { ArrowUp, Close, FullScreen, FullScreenV2, TableHeaderArrow } from "@/components/icons/icons";
import { RenderIf } from "@/components/shared";
import { CoinStatsTokenInfo } from "@/services/queries/charts/types";
import StarFilled from "@/components/icons/StarFilled";
import Star from "@/components/icons/Star";
import { useAtomValue, useSetAtom } from "jotai";
import { settingAtom, updateSettingAtom } from "@/lib/atoms/settingsAtom";
import { FullscreenControls } from "./fullscreen-controls";
import { set } from "lodash-es";
import FullScreenButtonV2 from "../shared/fullscreen-buttonv2";

const tableHeaderOptions = [
  {
    id: 1,
    label: "Price",
    value: "price",
  },
  {
    id: 2,
    label: "%24h",
    value: "priceChange1d",
  },
  {
    id: 3,
    label: "Vol (24h)",
    value: "volume",
  },
  {
    id: 4,
    label: "Marketcap",
    value: "marketCap",
  },
  {
    id: 5,
    label: "Circ. Supply",
    value: "availableSupply",
  },
];

interface IProps {
  widget: LayoutType["widgets"][0];
}

interface ITableHeader {
  onClick: () => void;
  title?: string;
  isActive: boolean;
  direction: "desc" | "asc";
}

// TableHeader moved to its own file

export default function Screener(props: IProps) {
  const { widget } = props;

  const [showInfo, setShowInfo] = useState(false);
  const [direction, setDirection] = useState<"desc" | "asc">("desc");
  const [dataKey, setDataKey] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);

  const { data = [] } = useFetchCoinStatsToken();
  const settings = useAtomValue(settingAtom);
  const updateSettings = useSetAtom(updateSettingAtom);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);

    if (!isFullscreen) {
      setIsControlsVisible(false);
    }
  };

  const sortedData = useMemo(() => {
    // No sorting applied

    const key = dataKey as keyof CoinStatsTokenInfo;

    let result = [...data];

    if (showFavorites && Array.isArray(settings.favorite_tokens)) {
      result = result.filter((item) => settings.favorite_tokens.includes(item.id));
    }
    if (!dataKey) return result;

    const sorted = [...result].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      // Handle string vs number vs null/undefined
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Fallback to string comparison
      return direction === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return sorted;
  }, [data, dataKey, direction, showFavorites, settings.favorite_tokens]);

  const handleFavourite = useCallback(
    (id: string) => {
      const isFavorite = settings?.favorite_tokens?.includes(id);

      let newFavoriteArray: string[] = [];

      if (isFavorite) {
        newFavoriteArray = settings?.favorite_tokens?.filter((item) => item !== id);
      } else {
        newFavoriteArray = [...settings?.favorite_tokens, id];
      }
      updateSettings({
        ...settings,
        favorite_tokens: newFavoriteArray,
      });
    },
    [settings, updateSettings],
  );

  const onAnimationComplete = useCallback(() => {
    if (!isFullscreen) {
      setIsControlsVisible(true);
    }
  }, [isFullscreen]);

  const memoizedSetDataKey = useCallback((key: string) => {
    setDataKey(key);
  }, []);

  const memoizedSetDirection = useCallback((dir: "asc" | "desc") => {
    setDirection(dir);
  }, []);

  useEffect(() => {
    setDirection("desc");
  }, [dataKey]);

  return (
    <WidgetWrapper
      title="SCREENER"
      widget={widget}
      handleLearnMore={() => {
        setShowInfo(true);
      }}
      titleIcon="none"
      // className="px-0 sm:px-0"
    >
      <div className={cn("flex h-full w-full flex-1 flex-col overflow-hidden", isFullscreen && "py-[60px]")}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={cn(
              "flex h-[32px] items-center gap-2 rounded-[10px] border border-[#212121] bg-[#181818] px-6 text-sm leading-[1] text-[#8E8E93]",
              !showFavorites && "bg-white text-[#0C0C0C]",
            )}
            onClick={() => {
              setShowFavorites(false);
            }}
          >
            All
          </button>

          <button
            type="button"
            className={cn(
              "flex h-[32px] items-center gap-2 rounded-[10px] border border-[#212121] bg-[#181818] px-6 text-sm leading-[1] text-[#8E8E93]",
              showFavorites && "bg-white text-[#0C0C0C]",
            )}
            onClick={() => {
              setShowFavorites(true);
            }}
          >
            <StarFilled />
            Favourites
          </button>
        </div>
        <ScreenerTable
          isFullscreen={isFullscreen}
          onAnimationComplete={onAnimationComplete}
          sortedData={sortedData}
          showFavorites={showFavorites}
          settings={settings}
          tableHeaderOptions={tableHeaderOptions}
          dataKey={dataKey}
          direction={direction}
          handleFavourite={handleFavourite}
          setDirection={memoizedSetDirection}
          setDataKey={memoizedSetDataKey}
        />
      </div>

      <FullscreenControls
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        handleShowAll={() => {
          setShowFavorites(false);
        }}
        handleShowFavorites={() => {
          setShowFavorites(true);
        }}
        showFavorites={showFavorites}
      />

      <FullScreenButtonV2 isControlsVisible={isControlsVisible} toggleFullscreen={toggleFullscreen} />

      {/* <div
        className={cn(
          "absolute right-[9px] bottom-[16px] z-[9] h-[28px] w-[28px] rounded-md border border-[#1c1c1c]",
          {
            // "opacity-0": !isControlsVisible,
            // "opacity-100": isControlsVisible,
          },
        )}
        style={{
          background:
            "linear-gradient(180deg, #1b1b1b 0%, rgba(0, 0, 0, 0.38) 72.15%)",
          backdropFilter: "blur(7px)",
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <button
          className="flex h-full w-full items-center justify-center"
          onClick={toggleFullscreen}
        >
          <FullScreen />
        </button>
      </div> */}

      <AnimatePresence>
        {showInfo && (
          <div className="absolute top-[10px] right-[10px] bottom-[10px] left-[10px] z-9 flex items-end">
            <motion.div
              className="scrollbar max-h-full overflow-auto rounded-[22px] bg-[#111] px-5 py-4"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <h3 className="text-base leading-[1.35] font-semibold text-white">SCREENER</h3>
                    <p className="text-[13px] leading-[1.25] font-light text-[#878787]">Learn about the Screener</p>
                  </div>
                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    The Screener provides a quick snapshot of major cryptocurrencies using recent market data. It helps
                    you compare key metrics like price, 24-hour change, volume, market cap, all in one view. <br />{" "}
                    <br /> It gives a helpful overview of the market’s current state, making it easier to spot top
                    assets, analyze trends, and make informed decisions at a glance.
                  </p>
                </div>

                <p className="text-xs font-semibold text-[#696969] text-[1.25]">
                  We use data from{" "}
                  <a href="https://coinstats.app/" target="_blank">
                    coinstats.app
                  </a>
                </p>

                <div className="flex justify-center">
                  <button
                    type="button"
                    className="app_widget_button flex h-[26px] items-center justify-center gap-1 rounded-[40px] bg-[#272727]"
                    onClick={() => {
                      setShowInfo(false);
                    }}
                  >
                    <p className="app_widget_button__text text-[13px] font-medium whitespace-nowrap text-white">
                      Close
                    </p>
                    <div className="app_widget_button__icon">
                      <Close fill="#878787" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </WidgetWrapper>
  );
}
