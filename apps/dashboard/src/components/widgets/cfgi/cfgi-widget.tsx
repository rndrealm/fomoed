"use client";

import CfgiCard from "@/components/widgets/cfgi/cfgi-card";
import { useReadCfgiData, useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "./coin-dropdown";
import { useMemo, useState } from "react";
import CifTab from "./cfgi-tab";
import PeriodDropdown from "./period-dropdown";
import { CfgiPeriods } from "@/constant/cfgi-data";
import { Skeleton } from "@/components/ui/skeleton";

const colorToCfgi = {
  25: "#FF3B10",
  50: "#EA9924",
  75: "#399F57",
  100: "#05A5A6",
};

export default function CfgiWidget() {
  const [activePeriod, setActivePeriod] = useState<string>(
    CfgiPeriods[0].value
  );
  const [activeCoin, setActiveCoin] = useState<string>("BTC");
  const { data: coinData } = useReadCoinList();

  const activeCoinSlug = useMemo(() => {
    return coinData?.find((coin) => coin.symbol === activeCoin)?.slug;
  }, [activeCoin, coinData]);
  const { data } = useReadCfgiData(
    activeCoin,
    activePeriod,
    activeCoinSlug || ""
  );

  return (
    <>
      <div className="w-[670px] h-[380px] flex flex-col justify-center bg-widget-background rounded-sm">
        <div className="px-3 py-4">
          {coinData ? (
            <div className="flex items-center justify-between">
              <CoinDropdown
                options={coinData || []}
                value={activeCoin}
                setValue={(coin: string) => {
                  setActiveCoin(coin);
                }}
              />
              <div className="flex items-center gap-2">
                <CifTab />
                <PeriodDropdown
                  options={CfgiPeriods}
                  value={activePeriod}
                  setValue={(value: string) => {
                    setActivePeriod(value);
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex-grow mx-3 ">
          {data ? (
            <CfgiCard cfgiData={data} />
          ) : (
            <Skeleton className="w-full h-full bg-widget-background-200" />
          )}
        </div>

        <div className="flex items-center justify-center gap-5 border-t border-t-[#333] py-3">
          {Object.entries(colorToCfgi).map(([_, color], index) => (
            <div className="flex items-center gap-2" key={index}>
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              ></div>
              <div className="text-xs text-grey">
                {index * 25}-{(index + 1) * 25}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
