import React, { useMemo } from "react";
import { useAtom } from "jotai";
import SearchIcon from "@/components/icons/SearchIcon";
import { Input } from "@/components/ui/input";
import { cn, hyperliquidFormatPriceChange } from "@/lib/utils";
import { motion } from "motion/react";
import { useReadHyperLiquidTokens } from "@/services/queries/hyperliquid";
import Star from "@/components/icons/Star";
import { PerpUniverse, SpotsUniverse } from "@/services/queries/hyperliquid/types";
import { tokenSearchValueAtom, tokenActiveCategoryAtom } from "@/lib/atoms/tradingViewWidget";

const categories = [
  { id: 1, label: "All", value: "all" },
  { id: 2, label: "Perps", value: "perps" },
  { id: 3, label: "Spot", value: "spot" },
];

interface ITokenTagProps {
  isSpot?: boolean;
  maxLeverage?: number;
}

function TokenTag(props: ITokenTagProps) {
  const { isSpot = false, maxLeverage } = props;
  return (
    <div
      className={cn("px-1 h-[16px] bg-[#151517] rounded-sm flex items-center justify-center", isSpot && "bg-[#2E241F]")}
    >
      <p className={cn("text-[10px] tracking-[-0.2%] leading-[1.0] text-[#00AF58]", isSpot && "text-[#C97038]")}>
        {isSpot ? "SPOT" : `${maxLeverage}X`}
      </p>
    </div>
  );
}

interface ITokenProps {
  isSpot?: boolean;
  baseTokenName?: string;
  quoteTokenName?: string;
  maxLeverage?: number;
}

function Token(props: ITokenProps) {
  const { isSpot = false, baseTokenName = "HYPE", quoteTokenName = "USDT", maxLeverage = 40 } = props;
  const tokenName = isSpot ? `${baseTokenName}/${quoteTokenName}` : `${baseTokenName}-${quoteTokenName}`;

  return (
    <div className="flex gap-1 items-center">
      <p className="text-[10px] tracking-[-0.2%] leading-[1.0] whitespace-nowrap text-white">{tokenName}</p>

      <TokenTag isSpot={isSpot} maxLeverage={maxLeverage} />
    </div>
  );
}

interface ITokenCategoryButtonProps {
  label?: string;
  isActive?: boolean;
  onClick?: () => void;
}

function TokenCategoryButton(props: ITokenCategoryButtonProps) {
  const { label, isActive, onClick } = props;

  return (
    <button type="button" className="px-4 py-1 relative" onClick={onClick}>
      <p className={cn("text-[10px] text-[#B0B0B0] leading-[1.35] relative z-[1]", isActive && "text-white")}>
        {label}
      </p>
      {isActive && (
        <motion.div
          className="absolute top-0 left-0 right-0 bottom-0 bg-[#101012] rounded-sm"
          layoutId="app_trading_catergory"
        ></motion.div>
      )}
    </button>
  );
}

interface IProps {
  handleSelectToken: (token: PerpUniverse | SpotsUniverse) => void;
}

export function TokenSelect(props: IProps) {
  const { handleSelectToken } = props;

  // Use Jotai atoms instead of useState
  const [searchValue, setSearchValue] = useAtom(tokenSearchValueAtom);
  const [activeCategory, setActiveCategory] = useAtom(tokenActiveCategoryAtom);

  const { data: tokensData } = useReadHyperLiquidTokens();

  const filteredCoins = useMemo(() => {
    let tokens = [...(tokensData?.allTokens || [])];

    if (activeCategory !== "all") {
      tokens = tokens.filter((coin) => {
        if (activeCategory === "perps") return !coin.isSpot;
        if (activeCategory === "spot") return coin.isSpot;
      });
    }

    if (!searchValue) return tokens;

    const search = searchValue.toLowerCase();

    return tokens.filter((coin) => {
      const nameMatch = coin?.name?.toLowerCase().includes(search);
      const baseTokenMatch = coin?.baseTokenName?.toLowerCase().includes(search);

      return nameMatch || baseTokenMatch;
    });
  }, [searchValue, activeCategory, tokensData]);

  return (
    <div className="w-full h-[337px] bg-[#0C0C0E] border border-[#202022] flex flex-col gap-2 rounded-2xl">
      <div className="p-3">
        <div className="w-full px-4 relative bg-[#101012] rounded-[10px] border border-[#161618]">
          <span className="absolute left-[16px] top-[53%] -translate-y-1/2">
            <SearchIcon />
          </span>
          <Input
            placeholder="Search..."
            className=" pl-6 pr-[9px] py-[1px] !text-xs placeholder:text-[#737373] bg-transparent text-[#D1D1D1] focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none [&:focus-visible]:outline-none [&:focus]:outline-none transition-all w-full border-none focus-visible:ring-0 h-[36px]"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="flex gap-2 items-center">
          <div className="flex items-center rounded-sm bg-[#1F1F21] overflow-hidden">
            {categories.map((item) => {
              return (
                <TokenCategoryButton
                  key={item.id}
                  label={item.label}
                  isActive={item.value === activeCategory}
                  onClick={() => {
                    setActiveCategory(item?.value);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto scrollbar px-2">
        <table className="w-full table-auto rounded-lg borde border-[#262626] border-separate border-spacing-0">
          <thead className="sticky top-0 z-[3] bg-[#101012]">
            <tr>
              <th className="rounded-tl-lg">
                <div className="w-[12px] h-[12px]"></div>
              </th>
              <th className="px-1 py-3 text-left text-[#B0B0B0] text-[10px] leading-[1.0] tracking-[-0.2%] whitespace-nowrap bg-[101012] bordr-r border-[#262626]">
                Symbol
              </th>

              <th className="px-1 py-3 text-left text-[10px] leading-[1.0] tracking-[-0.4%] whitespace-nowrap text-[#B0B0B0] bg-[101012]">
                Last Price
              </th>
              <th className="px-1 py-3 text-left text-[10px] leading-[1.0] tracking-[-0.4%] whitespace-nowrap text-[#B0B0B0] bg-[101012]">
                24H Change
              </th>
              <th className="px-1 py-3 text-left text-[10px] leading-[1.0] tracking-[-0.4%] whitespace-nowrap text-[#B0B0B0] bg-[101012]">
                Volume
              </th>

              <th className="px-1 py-3 text-left text-[10px] leading-[1.0] tracking-[-0.4%] whitespace-nowrap text-[#B0B0B0] bg-[101012] rounded-tr-lg">
                Open Interest
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCoins.map((item) => {
              const _openInterest =
                parseFloat(item?.priceVolume?.openInterest || "0") * parseFloat(item?.priceVolume?.markPx || "0");

              const { priceChange, priceChangePercent, currentPrice, volume, isPositive, openInterest } =
                hyperliquidFormatPriceChange(
                  item?.priceVolume?.midPx || 0,
                  item?.priceVolume?.prevDayPx || 0,
                  item?.priceVolume?.dayNtlVlm || 0,
                  _openInterest,
                );

              const priceSymbol = isPositive ? "+" : "";

              return (
                <tr
                  key={item?.name}
                  className="hover:bg-[#1A1A1C] transition-colors cursor-pointer"
                  onClick={() => {
                    handleSelectToken(item);
                  }}
                >
                  <td className="py-3 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap text-[#FAFAFA] bordr-r border-[#2D2D2D]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e?.stopPropagation();
                      }}
                    >
                      <div className="w-[20px] h-[20px] flex items-center justify-center">
                        <Star />
                      </div>
                    </button>
                  </td>
                  <td className="py-3 px-1 whitespace-nowrap">
                    <Token
                      baseTokenName={item?.baseTokenName}
                      quoteTokenName={item?.quoteTokenName}
                      isSpot={item?.isSpot}
                      maxLeverage={item?.maxLeverage}
                    />
                  </td>
                  <td className="py-3 px-1 text-[10px] tracking-[-0.2%] leading-[1.0] whitespace-nowrap font-medium text-[#FAFAFA]">
                    {currentPrice}
                  </td>
                  <td
                    className={cn(
                      "py-3 px-1 text-[10px] tracking-[-0.2%] leading-[1.0] whitespace-nowrap font-medium text-[#00C087]",
                      !isPositive && "text-[#E77977]",
                    )}
                  >
                    {priceSymbol}
                    {priceChange}/{priceSymbol}
                    {priceChangePercent}
                  </td>
                  <td className="py-3 px-1 text-[10px] tracking-[-0.2%] leading-[1.0] whitespace-nowrap font-medium text-[#FAFAFA]">
                    {volume}
                  </td>

                  <td className="py-3 px-1 text-[10px] tracking-[-0.2%] leading-[1.0] whitespace-nowrap font-medium text-[#FAFAFA]">
                    {openInterest}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
