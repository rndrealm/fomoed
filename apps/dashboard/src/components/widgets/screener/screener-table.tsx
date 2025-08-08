import React, { memo } from "react";
import { RenderIf } from "@/components/shared";
import Image from "next/image";
import { cn, formatMarketCapNumber, formatPriceSignificant } from "@/lib/utils";
import { TableHeader } from "./table-header";
import StarFilled from "@/components/icons/StarFilled";
import Star from "@/components/icons/Star";
import { CoinStatsTokenInfo } from "@/services/queries/charts/types";
import { FullscreenableContainer } from "../shared";

interface ScreenerTableProps {
  isFullscreen: boolean;
  onAnimationComplete?: () => void;
  sortedData: CoinStatsTokenInfo[];
  showFavorites: boolean;
  settings: any; // Using any for brevity, consider using a proper type
  tableHeaderOptions: {
    id: number;
    label: string;
    value: string;
  }[];
  dataKey: string;
  direction: "asc" | "desc";
  handleFavourite: (id: string) => void;
  setDirection: (direction: "asc" | "desc") => void;
  setDataKey: (key: string) => void;
}

/**
 * Memoized screener table component with fullscreen capability
 */
const ScreenerTable = memo((props: ScreenerTableProps) => {
  const {
    isFullscreen,
    onAnimationComplete,
    sortedData,
    showFavorites,
    settings,
    tableHeaderOptions,
    dataKey,
    direction,
    handleFavourite,
    setDirection,
    setDataKey,
  } = props;
  return (
    <FullscreenableContainer
      isFullscreen={isFullscreen}
      onAnimationComplete={onAnimationComplete}
    >
      <div
        className={cn(
          "scrollbar flex flex-1 flex-col h-full overflow-auto pb-14",
          isFullscreen && "pt-[50px]",
        )}
      >
        <RenderIf
          condition={!showFavorites || settings?.favorite_tokens?.length !== 0}
        >
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
              {sortedData.map((item) => {
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
                          <RenderIf
                            condition={settings?.favorite_tokens?.includes(
                              item?.id,
                            )}
                          >
                            <StarFilled />
                          </RenderIf>

                          <RenderIf
                            condition={
                              !settings?.favorite_tokens?.includes(item?.id)
                            }
                          >
                            <Star />
                          </RenderIf>
                        </button>
                        <div className="overflow-hiiden h-[24px] w-[24px] rounded-[50%]">
                          <Image
                            width={24}
                            height={24}
                            src={item?.icon}
                            alt="Coin Icon"
                            className="h-full w-full"
                          />
                        </div>
                        <a href={item?.websiteUrl} target="_blank">
                          <p className="text-[13px] leading-[18px] font-semibold text-white">
                            {item.symbol}
                          </p>
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
                      {formatMarketCapNumber(
                        item?.availableSupply || "",
                        false,
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </RenderIf>
        <RenderIf condition={settings?.favorite_tokens?.length === 0}>
          <div className="flex w-full flex-1 flex-col justify-center gap-[10px]">
            <p className="text-center text-sm leading-[1] text-[#8E8E93]">
              You currently have no favorite tokens
            </p>
            <div className="flex items-center justify-center gap-1">
              <p className="text-center text-sm leading-[1] text-[#8E8E93]">
                Click on the
              </p>
              <StarFilled />

              <p className="text-center text-sm leading-[1] text-[#8E8E93]">
                Icon to add a token to favourites
              </p>
            </div>
          </div>
        </RenderIf>
      </div>
    </FullscreenableContainer>
  );
});

// Display name for debugging
ScreenerTable.displayName = "ScreenerTable";

export default ScreenerTable;
