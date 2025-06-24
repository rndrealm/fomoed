"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { WidgetWrapper } from "../shared";
import { useFetchCoinStatsToken } from "@/services/queries/charts";
import {
  cn,
  formatMarketCapNumber,
  formatPriceSignificant,
  modalSlide,
} from "@/lib/utils";
import { ArrowUp, Close, TableHeaderArrow } from "@/components/icons/icons";
import { RenderIf } from "@/components/shared";
import { CoinStatsTokenInfo } from "@/services/queries/charts/types";

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
      <button
        type="button"
        onClick={onClick}
        className="flex items-center ml-auto gap-1"
      >
        <div
          // className={cn(isActive ? "opacity-1" : "opacity-0")}
          style={{
            opacity: isActive ? 1 : 0,
          }}
        >
          <TableHeaderArrow up={direction === "desc"} />
        </div>

        <p className="text-sm text-[#8E8E93] leading-[1] whitespace-nowrap text-right">
          {title}
        </p>
      </button>
    </th>
  );
};

export default function Screener(props: IProps) {
  const { widget } = props;

  const [showInfo, setShowInfo] = useState(false);
  const [direction, setDirection] = useState<"desc" | "asc">("desc");
  const [dataKey, setDataKey] = useState("");

  const { data = [] } = useFetchCoinStatsToken();

  useEffect(() => {
    setDirection("desc");
  }, [dataKey]);

  const sortedData = useMemo(() => {
    if (!dataKey) return data; // No sorting applied

    const key = dataKey as keyof CoinStatsTokenInfo;

    const sorted = [...data].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      // Handle string vs number vs null/undefined
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
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
  }, [data, dataKey, direction]);

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
      <div className="w-full overflow-auto scrollbar">
        <table className="table-auto w-full">
          <thead className="sticky top-0 z-2 bg-[#000]">
            <tr>
              <th className="text-sm text-[#8E8E93] leading-[1] whitespace-nowrap p-3 text-left cursor-pointer">
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
                  <td className="py-2 border-y border-[#121212] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-[24px] h-[24px] overflow-hiiden rounded-[50%]">
                        <Image
                          width={24}
                          height={24}
                          src={item?.icon}
                          alt="Coin Icon"
                          className="w-full h-full"
                        />
                      </div>
                      <a href={item?.websiteUrl} target="_blank">
                        <p className="text-[13px] text-white leading-[18px] font-semibold">
                          {item.symbol}
                        </p>
                      </a>
                    </div>
                  </td>
                  <td className="text-[13px] text-white leading-[1] px-3 py-2 text-right border-y border-[#121212] whitespace-nowrap">
                    ${formatPriceSignificant(item?.price, 7)}
                  </td>
                  <td className="text-[13px] text-white leading-[1] px-3 py-2 text-right border-y border-[#121212] whitespace-nowrap">
                    {item?.priceChange1d}%
                  </td>
                  <td className="text-[13px] text-white leading-[1] px-3 py-2 text-right border-y border-[#121212] whitespace-nowrap">
                    {formatMarketCapNumber(item?.volume)}
                  </td>
                  <td className="text-[13px] text-white leading-[1] px-3 py-2 text-right border-y border-[#121212] whitespace-nowrap">
                    {formatMarketCapNumber(item?.marketCap)}
                  </td>
                  <td className="text-[13px] text-white leading-[1] px-3 py-2 text-right border-y border-[#121212] whitespace-nowrap">
                    {formatMarketCapNumber(item?.availableSupply || "", false)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showInfo && (
          <div className="absolute  bottom-[10px] left-[10px] right-[10px] top-[10px] z-9 flex items-end">
            <motion.div
              className="bg-[#111] rounded-[22px] py-4 px-5 overflow-auto max-h-full scrollbar"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-base leading-[1.35] text-white">
                      SCREENER
                    </h3>
                    <p className="font-light text-[13px] leading-[1.25] text-[#878787]">
                      Learn about the Screener
                    </p>
                  </div>
                  <p className="font-medium text-[13px] leading-[1.35] text-white">
                    The Screener provides a quick snapshot of major
                    cryptocurrencies using recent market data. It helps you
                    compare key metrics like price, 24-hour change, volume,
                    market cap, all in one view. <br /> <br /> It gives a
                    helpful overview of the market’s current state, making it
                    easier to spot top assets, analyze trends, and make informed
                    decisions at a glance.
                  </p>
                </div>

                <p className="text-[#696969] text-xs font-semibold text-[1.25]">
                  We use data from{" "}
                  <a href="https://coinstats.app/" target="_blank">
                    coinstats.app
                  </a>
                </p>

                <div className="flex justify-center">
                  <button
                    type="button"
                    className="rounded-[40px] bg-[#272727] flex items-center justify-center gap-1 h-[26px] app_widget_button"
                    onClick={() => {
                      setShowInfo(false);
                    }}
                  >
                    <p className="font-medium text-[13px] text-white whitespace-nowrap app_widget_button__text">
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
