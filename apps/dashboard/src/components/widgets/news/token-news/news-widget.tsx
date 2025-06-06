"use client";
import React, { useState } from "react";
import { OptionsDropdown } from "../../shared/options-dropwdown";
import { Dominance, NewsItemIcon } from "@/components/icons/icons";
import CoinStatsTokenDropdown from "../../shared/coin-stats-token-dropdown";
import { useReadCoinList } from "@/services/queries/charts";
import { formatNewsDate } from "@/lib/utils";

const data = [
  {
    id: 1,
    news: "BITCOIN LEDGER BUG PATCHED AFTER ‘SERIOUS’ FLAW SPOTTED IN XRPL LIBRARY",
  },
  {
    id: 2,
    news: "ETH BREAKS $2500 ATH",
  },
  {
    id: 3,
    news: "TRUMP PLACES TARIFF ON ALL CRYPTO TRANSACTIONS.",
  },
  {
    id: 4,
    news: "BTC BREAKS $111,500 ATH",
  },
];

interface INewsItem {
  news: string;
}

function NewsItem(props: INewsItem) {
  const { news } = props;

  return (
    <div className="flex items-center gap-4 py-[10px] px-3 rounded-[10px] cursor-pointer hover:bg-[#111111]">
      <div className="w-[24px] h-[24px] rounded-sm bg-white flex items-center justify-center">
        <NewsItemIcon />
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <h1 className="text-white text-sm font-medium leading-[1.25] line-clamp-2 flex-1">
          {news}
        </h1>
        <div className="flex items-center gap-1">
          <div className="w-[3px] h-[3px] rounded-[50%] bg-[#FF3B10]"></div>
          <p className="text-[#A5A5A5] font-normal leading-[1.35] text-[10px]">
            {formatNewsDate()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function NewsWidget() {
  const { data: coinData = [] } = useReadCoinList();

  const [selectedCoin, setSelectedCoin] = useState("BTC");

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 rounded-[30px] bg-[#000] relative overflow-hidden ">
      <div className="flex flex-col gap-1">
        <div className="flex justify-center">
          <div className="cursor-grab w-[36px] h-[5px] bg-[#444] rounded-[2px]"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Dominance />
            <h4 className="text-base text-[#878787] leading-[1.35] font-semibold">
              NEWS
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <CoinStatsTokenDropdown
              options={coinData}
              setValue={(coin) => {
                setSelectedCoin(coin);
              }}
              value={selectedCoin}
              align="end"
            />
            <OptionsDropdown />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 overflow-auto pb-4">
        {data?.map((item) => {
          return <NewsItem key={item.id} news={item.news} />;
        })}
      </div>
    </div>
  );
}
