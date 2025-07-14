"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { WidgetWrapper } from "../shared";
import { useFetchCoinStatsToken } from "@/services/queries/charts";
import { cn, formatMarketCapNumber, formatPriceSignificant, modalSlide } from "@/lib/utils";
import { ArrowUp, Close, TableHeaderArrow } from "@/components/icons/icons";
import { RenderIf } from "@/components/shared";
import { CoinStatsTokenInfo } from "@/services/queries/charts/types";
import StarFilled from "@/components/icons/StarFilled";
import Star from "@/components/icons/Star";
import { useAtomValue, useSetAtom } from "jotai";
import { settingAtom, updateSettingAtom } from "@/lib/atoms/settingsAtom";

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

const TableHeader = (props: ITableHeader) => {
  const { onClick, title, isActive, direction } = props;
  return (
    <th className="p-3">
      <button type="button" onClick={onClick} className="ml-auto flex items-center gap-1">
        <div
          // className={cn(isActive ? "opacity-1" : "opacity-0")}
          style={{
            opacity: isActive ? 1 : 0,
          }}
        >
          <TableHeaderArrow up={direction === "desc"} />
        </div>

        <p className="text-right text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">{title}</p>
      </button>
    </th>
  );
};

export default function Screener(props: IProps) {
  const { widget } = props;

  const [showInfo, setShowInfo] = useState(false);
  const [direction, setDirection] = useState<"desc" | "asc">("desc");
  const [dataKey, setDataKey] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  const { data = [] } = useFetchCoinStatsToken();
  const settings = useAtomValue(settingAtom);
  const updateSettings = useSetAtom(updateSettingAtom);

  useEffect(() => {
    setDirection("desc");
  }, [dataKey]);

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

  const handleFavourite = (id: string) => {
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
  };

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
      <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={cn(
              "flex h-[32px] items-center gap-2 rounded-[10px] border border-[#212121] bg-[#181818] px-6 text-sm leading-[1] text-[#8E8E93]",
              !showFavorites && "bg-white text-[#0C0C0C]"
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
              showFavorites && "bg-white text-[#0C0C0C]"
            )}
            onClick={() => {
              setShowFavorites(true);
            }}
          >
            <StarFilled />
            Favourites
          </button>
        </div>
        <div className="scrollbar flex flex-1 flex-col overflow-auto">
          <RenderIf condition={!showFavorites || settings?.favorite_tokens?.length !== 0}>
            <table className="w-full table-auto">
              <thead className="sticky top-0 z-2 bg-[#000]">
                <tr>
                  <th className="cursor-pointer p-3 text-left text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">
                    Symbol
                  </th>

                  {tableHeaderOptions.map((item) => {
                    return (
                      <TableHeader
                        key={item.id}
                        onClick={() => {
                          if (item?.value === dataKey) {
                            setDirection(direction === "asc" ? "desc" : "asc");
                            return;
                          }
                          setDataKey(item?.value);
                        }}
                        title={item.label}
                        isActive={dataKey === item?.value}
                        direction={direction}
                      />
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => {
                  return (
                    <tr key={item.id}>
                      <td className="border-y border-[#121212] py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            className="flex h-[24px] w-[24px] items-center justify-center"
                            type="button"
                            onClick={() => {
                              handleFavourite(item?.id);
                            }}
                          >
                            <RenderIf condition={settings?.favorite_tokens?.includes(item?.id)}>
                              {/* <motion.div
                              initial={{ rotate: 0 }}
                              animate={{ rotate: [-30, 30, -15, 15, 0] }}
                              transition={{
                                duration: 1,
                                times: [0, 0.2, 0.4, 0.8, 1],
                              }}
                            >
                              <StarFilled />
                            </motion.div> */}
                              <StarFilled />
                            </RenderIf>

                            <RenderIf condition={!settings?.favorite_tokens?.includes(item?.id)}>
                              <Star />
                            </RenderIf>
                          </button>
                          <div className="overflow-hiiden h-[24px] w-[24px] rounded-[50%]">
                            <Image width={24} height={24} src={item?.icon} alt="Coin Icon" className="h-full w-full" />
                          </div>
                          <a href={item?.websiteUrl} target="_blank">
                            <p className="text-[13px] leading-[18px] font-semibold text-white">{item.symbol}</p>
                          </a>
                        </div>
                      </td>
                      <td className="border-y border-[#121212] px-3 py-2 text-right text-[13px] leading-[1] whitespace-nowrap text-white">
                        ${formatPriceSignificant(item?.price, 7)}
                      </td>
                      <td className="border-y border-[#121212] px-3 py-2 text-right text-[13px] leading-[1] whitespace-nowrap text-white">
                        {item?.priceChange1d}%
                      </td>
                      <td className="border-y border-[#121212] px-3 py-2 text-right text-[13px] leading-[1] whitespace-nowrap text-white">
                        {formatMarketCapNumber(item?.volume)}
                      </td>
                      <td className="border-y border-[#121212] px-3 py-2 text-right text-[13px] leading-[1] whitespace-nowrap text-white">
                        {formatMarketCapNumber(item?.marketCap)}
                      </td>
                      <td className="border-y border-[#121212] px-3 py-2 text-right text-[13px] leading-[1] whitespace-nowrap text-white">
                        {formatMarketCapNumber(item?.availableSupply || "", false)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </RenderIf>
          <RenderIf condition={settings?.favorite_tokens?.length === 0}>
            <div className="flex w-full flex-1 flex-col justify-center gap-[10px]">
              <p className="text-center text-sm leading-[1] text-[#8E8E93]">You currently have no favorite tokens</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-center text-sm leading-[1] text-[#8E8E93]">Click on the</p>
                <StarFilled />

                <p className="text-center text-sm leading-[1] text-[#8E8E93]">Icon to add a token to favourites</p>
              </div>
            </div>
          </RenderIf>
        </div>
      </div>

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
