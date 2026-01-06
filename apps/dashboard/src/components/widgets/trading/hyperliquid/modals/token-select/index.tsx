import SearchIcon from "@/components/icons/SearchIcon";
import { Input } from "@/components/ui/input";
import { useReadHyperLiquidTokens } from "@/services/queries/hyperliquid";
import { PerpUniverse, SpotsUniverse } from "@/services/queries/hyperliquid/types";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useMemo, useRef, useState } from "react";
import { TokenCategoryButton } from "./token-category-button";
import { TokenRow } from "./token-row";
import { SortableHeader } from "./sortable-header";

const categories = [
  { id: 1, label: "All", value: "all" },
  { id: 2, label: "Perps", value: "perps" },
  { id: 3, label: "Spot", value: "spot" },
];

interface IProps {
  handleSelectToken: (token: PerpUniverse | SpotsUniverse) => void;
}

export type SortField = "volume" | "price" | "openInterest" | "change";
type SortDirection = "asc" | "desc";

export function TokenSelect(props: IProps) {
  const { handleSelectToken } = props;

  const [searchValue, setSearchValue] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortField, setSortField] = useState<SortField>("volume");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { data: tokensData } = useReadHyperLiquidTokens();

  const parentRef = useRef<HTMLDivElement>(null);

  const filteredCoins = useMemo(() => {
    let tokens: (PerpUniverse | SpotsUniverse)[] = tokensData?.allTokens || [];

    // Filter by category
    if (activeCategory !== "all") {
      tokens = tokens.filter((coin) => {
        if (activeCategory === "perps") return !coin.isSpot;
        if (activeCategory === "spot") return coin.isSpot;
      });
    }

    // Filter by search
    if (searchValue) {
      const search = searchValue.toLowerCase();
      tokens = tokens.filter((coin) => {
        const nameMatch = coin?.name?.toLowerCase().includes(search);
        const baseTokenMatch = coin?.baseTokenName?.toLowerCase().includes(search);
        return nameMatch || baseTokenMatch;
      });
    }

    // Sort by volume after filtering (smaller array to sort)
    return [...tokens].sort((a, b) => {
      let valueA = 0;
      let valueB = 0;

      if (sortField === "volume") {
        valueA = parseFloat(a?.priceVolume?.dayNtlVlm || "0");
        valueB = parseFloat(b?.priceVolume?.dayNtlVlm || "0");
      } else if (sortField === "price") {
        valueA = parseFloat(a?.priceVolume?.midPx || "0");
        valueB = parseFloat(b?.priceVolume?.midPx || "0");
      } else if (sortField === "openInterest") {
        const openInterestA =
          parseFloat(a?.priceVolume?.openInterest || "0") * parseFloat(a?.priceVolume?.markPx || "0");
        const openInterestB =
          parseFloat(b?.priceVolume?.openInterest || "0") * parseFloat(b?.priceVolume?.markPx || "0");
        valueA = openInterestA;
        valueB = openInterestB;
      } else if (sortField === "change") {
        let priceChangeA = parseFloat(a?.priceVolume?.midPx || "0") - parseFloat(a?.priceVolume?.prevDayPx || "0");
        let priceChangeB = parseFloat(b?.priceVolume?.midPx || "0") - parseFloat(b?.priceVolume?.prevDayPx || "0");

        let priceChangePercentA = (priceChangeA / parseFloat(a?.priceVolume?.prevDayPx || "1")) * 100;
        let priceChangePercentB = (priceChangeB / parseFloat(b?.priceVolume?.prevDayPx || "1")) * 100;
        valueA = priceChangePercentA;
        valueB = priceChangePercentB;
      }

      return sortDirection === "desc" ? valueB - valueA : valueA - valueB;
    });
  }, [searchValue, activeCategory, tokensData?.allTokens, sortField, sortDirection]);

  const rowVirtualizer = useVirtualizer({
    count: filteredCoins.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Approximate row height in pixels (adjust if needed)
    overscan: 20, // Render 5 extra items off-screen for smoother scrolling
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }

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
      <div ref={parentRef} className="flex-1 overflow-auto scrollbar px-2">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
          <table className="w-full table-auto rounded-lg borde border-[#262626] border-separate border-spacing-0">
            <thead className="sticky top-0 z-[3] bg-[#101012]">
              <tr>
                <th className="rounded-tl-lg">
                  <div className="w-[12px] h-[12px]"></div>
                </th>
                <th className="px-1 py-3 text-left text-[#B0B0B0] text-[10px] leading-[1.0] tracking-[-0.2%] whitespace-nowrap bg-[101012] bordr-r border-[#262626]">
                  Symbol
                </th>

                <SortableHeader
                  direction={sortDirection}
                  label="Last Price"
                  field="price"
                  onClick={handleSort}
                  isActive={sortField === "price"}
                />

                <SortableHeader
                  direction={sortDirection}
                  label="24H Change"
                  field="change"
                  onClick={handleSort}
                  isActive={sortField === "change"}
                />

                <SortableHeader
                  direction={sortDirection}
                  label="Volume"
                  field="volume"
                  onClick={handleSort}
                  isActive={sortField === "volume"}
                />

                <SortableHeader
                  direction={sortDirection}
                  label="Open Interest"
                  field="openInterest"
                  onClick={handleSort}
                  isActive={sortField === "openInterest"}
                />
              </tr>
            </thead>
            <tbody>
              {/* {filteredCoins.map((item) => {
                return <TokenRow key={item?.name} item={item} onSelect={handleSelectToken} />;
              })} */}

              {virtualItems.map((virtualRow, index) => {
                const item = filteredCoins[virtualRow.index];
                const height = `${virtualRow.size}px`;
                const transform = `translateY(${virtualRow.start - index * virtualRow.size}px)`;

                return (
                  <TokenRow
                    key={item?.name || virtualRow.index}
                    item={item}
                    onSelect={handleSelectToken}
                    height={height}
                    transform={transform}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
