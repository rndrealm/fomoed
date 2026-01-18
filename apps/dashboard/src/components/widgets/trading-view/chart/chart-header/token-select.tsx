import React, { useMemo, useRef, useState, useEffect } from "react";
import { useAtom } from "jotai";
import SearchIcon from "@/components/icons/SearchIcon";
import { Input } from "@/components/ui/input";
import { cn, hyperliquidFormatPriceChange } from "@/lib/utils";
import { motion } from "motion/react";
import { useReadHyperLiquidTokens } from "@/services/queries/hyperliquid";
import { useSearchStocks, useReadAlpacaStocks } from "@/services/queries/alpaca";
import { PerpUniverse, SpotsUniverse } from "@/services/queries/hyperliquid/types";
import { StockSymbol, UnifiedSymbol } from "@/lib/atoms/tradingViewWidget";
import { tokenSearchValueAtom, tokenActiveCategoryAtom } from "@/lib/atoms/tradingViewWidget";

const categories = [
  { id: 1, label: "Crypto", value: "crypto" },
  { id: 2, label: "Stocks", value: "stocks" },
];

interface ITokenTagProps {
  isSpot?: boolean;
  maxLeverage?: number;
  isStock?: boolean;
}

function TokenTag(props: ITokenTagProps) {
  const { isSpot = false, maxLeverage, isStock = false } = props;
  
  if (isStock) {
    return (
      <div className="px-1 h-[16px] bg-[#1A2B1A] rounded-sm flex items-center justify-center">
        <p className="text-[10px] tracking-[-0.2%] leading-[1.0] text-[#4CAF50]">STOCK</p>
      </div>
    );
  }
  
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
  isStock?: boolean;
  stockName?: string;
}

function Token(props: ITokenProps) {
  const { isSpot = false, baseTokenName = "HYPE", quoteTokenName = "USDT", maxLeverage = 40, isStock = false, stockName } = props;
  
  if (isStock) {
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex gap-1 items-center">
          <p className="text-[11px] tracking-[-0.2%] leading-[1.0] whitespace-nowrap text-white font-medium">{baseTokenName}</p>
          <TokenTag isStock={true} />
        </div>
        {stockName && (
          <p className="text-[9px] text-[#737373] leading-[1.0]">{stockName}</p>
        )}
      </div>
    );
  }

  const tokenName = isSpot 
    ? `${baseTokenName}/${quoteTokenName}` 
    : `${baseTokenName}-${quoteTokenName}`;

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
  handleSelectToken: (token: UnifiedSymbol) => void;
}

export function TokenSelect(props: IProps) {
  const { handleSelectToken } = props;

  const [searchValue, setSearchValue] = useAtom(tokenSearchValueAtom);
  const [activeCategory, setActiveCategory] = useAtom(tokenActiveCategoryAtom);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  const { data: tokensData } = useReadHyperLiquidTokens();
  const { data: featuredStocksData } = useReadAlpacaStocks();

  const { data: searchStocksData, isLoading: stocksSearchLoading } = useSearchStocks(
    activeCategory === "stocks" && searchValue.length >= 1 ? searchValue : ""
  );

  const displayedAssets = useMemo(() => {
    if (activeCategory === "crypto") {
      let cryptoAssets = (tokensData?.allTokens || []).map(token => ({
        ...token,
        type: "crypto" as const,
      }));

      if (searchValue) {
        const search = searchValue.toLowerCase();
        cryptoAssets = cryptoAssets.filter((crypto) => {
          return (
            crypto.name?.toLowerCase().includes(search) ||
            crypto.baseTokenName?.toLowerCase().includes(search)
          );
        });
      }

      return cryptoAssets;
    } else {
      if (searchValue.length >= 1 && searchStocksData?.stocks) {
        return searchStocksData.stocks;
      } else {
        return featuredStocksData?.stocks || [];
      }
    }
  }, [activeCategory, searchValue, tokensData, featuredStocksData, searchStocksData]);

  const visibleAssets = useMemo(() => {
    if (activeCategory === "stocks" && displayedAssets.length > 100) {
      return displayedAssets.slice(visibleRange.start, visibleRange.end);
    }
    return displayedAssets;
  }, [displayedAssets, activeCategory, visibleRange]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || activeCategory !== "stocks" || displayedAssets.length <= 100) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const rowHeight = 48;
      const visibleCount = 50;
      const buffer = 10; 

      const start = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
      const end = Math.min(displayedAssets.length, start + visibleCount + buffer * 2);

      setVisibleRange({ start, end });
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeCategory, displayedAssets.length]);

  useEffect(() => {
    setVisibleRange({ start: 0, end: 50 });
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeCategory, searchValue]);

  return (
    <div className="w-full h-[337px] bg-[#0C0C0E] border border-[#202022] flex flex-col gap-2 rounded-2xl">
      <div className="p-3">
        <div className="w-full px-4 relative bg-[#101012] rounded-[10px] border border-[#161618]">
          <span className="absolute left-[16px] top-[53%] -translate-y-1/2">
            <SearchIcon />
          </span>
          <Input
            placeholder={activeCategory === "stocks" ? "Search stocks... (e.g. AAPL, Tesla)" : "Search crypto..."}
            className="pl-6 pr-[9px] py-[1px] !text-xs placeholder:text-[#737373] bg-transparent text-[#D1D1D1] focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none [&:focus-visible]:outline-none [&:focus]:outline-none transition-all w-full border-none focus-visible:ring-0 h-[36px]"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="flex gap-2 items-center justify-between">
          <div className="flex items-center rounded-sm bg-[#1F1F21] overflow-hidden">
            {categories.map((item) => {
              return (
                <TokenCategoryButton
                  key={item.id}
                  label={item.label}
                  isActive={item.value === activeCategory}
                  onClick={() => {
                    setActiveCategory(item?.value);
                    setSearchValue(""); 
                  }}
                />
              );
            })}
          </div>
          
          <div className="text-[10px] text-[#737373]">
            {activeCategory === "stocks" && stocksSearchLoading ? (
              <span>Searching...</span>
            ) : (
              <span>
                {displayedAssets.length} {activeCategory === "stocks" ? "stocks" : "tokens"}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto scrollbar px-2" ref={scrollContainerRef}>
        <table className="w-full table-fixed rounded-lg border border-[#262626] border-separate border-spacing-0">
          <colgroup>
            <col style={{ width: activeCategory === "stocks" ? '70%' : 'auto' }} /> 
            {activeCategory === "stocks" ? (
              <col style={{ width: '30%' }} />
            ) : (
              <>
                <col style={{ width: 'auto' }} /> 
                <col style={{ width: 'auto' }} /> 
                <col style={{ width: 'auto' }} />
                <col style={{ width: 'auto' }} />
              </>
            )}
          </colgroup>
          <thead className="sticky top-0 z-[3] bg-[#101012]">
            <tr>
              <th className="px-3 py-3 text-left text-[#B0B0B0] text-[10px] leading-[1.0] tracking-[-0.2%] whitespace-nowrap bg-[101012] rounded-tl-lg">
                Symbol
              </th>
              {activeCategory === "crypto" ? (
                <>
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
                </>
              ) : (
                <th className="px-1 py-3 text-left text-[10px] leading-[1.0] tracking-[-0.4%] whitespace-nowrap text-[#B0B0B0] bg-[101012] rounded-tr-lg">
                  Exchange
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {activeCategory === "stocks" && displayedAssets.length > 100 && visibleRange.start > 0 && (
              <tr style={{ height: `${visibleRange.start * 48}px` }}>
                <td colSpan={2}></td>
              </tr>
            )}
            
            {visibleAssets.map((item) => {
              const uniqueKey = `${item.type}-${item.type === "stock" ? (item as StockSymbol).symbol : (item as PerpUniverse | SpotsUniverse).name}`;
              
              if (item.type === "stock") {
                const stock = item as StockSymbol;
                return (
                  <tr
                    key={uniqueKey}
                    className="hover:bg-[#1A1A1C] transition-colors cursor-pointer"
                    onClick={() => handleSelectToken(item)}
                  >
                    <td className="py-3 px-3 whitespace-nowrap overflow-hidden text-ellipsis">
                      <Token 
                        baseTokenName={stock.symbol} 
                        isStock={true} 
                        stockName={stock.name}
                      />
                    </td>
                    <td className="py-3 px-1 text-[10px] tracking-[-0.2%] leading-[1.0] whitespace-nowrap font-medium text-[#FAFAFA] overflow-hidden text-ellipsis">
                      {stock.exchange}
                    </td>
                  </tr>
                );
              } else {
                const crypto = item as PerpUniverse | SpotsUniverse;
                const _openInterest =
                  parseFloat(crypto?.priceVolume?.openInterest || "0") * parseFloat(crypto?.priceVolume?.markPx || "0");

                const { priceChange, priceChangePercent, currentPrice, volume, isPositive, openInterest } =
                  hyperliquidFormatPriceChange(
                    crypto?.priceVolume?.midPx || 0,
                    crypto?.priceVolume?.prevDayPx || 0,
                    crypto?.priceVolume?.dayNtlVlm || 0,
                    _openInterest,
                  );

                const priceSymbol = isPositive ? "+" : "";

                return (
                  <tr
                    key={uniqueKey}
                    className="hover:bg-[#1A1A1C] transition-colors cursor-pointer"
                    onClick={() => handleSelectToken(item)}
                  >
                    <td className="py-3 px-3 whitespace-nowrap overflow-hidden text-ellipsis">
                      <Token
                        baseTokenName={crypto?.baseTokenName}
                        quoteTokenName={crypto?.quoteTokenName}
                        isSpot={crypto?.isSpot}
                        maxLeverage={crypto?.maxLeverage}
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
              }
            })}
            
            {activeCategory === "stocks" && displayedAssets.length > 100 && visibleRange.end < displayedAssets.length && (
              <tr style={{ height: `${(displayedAssets.length - visibleRange.end) * 48}px` }}>
                <td colSpan={2}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}