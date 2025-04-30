"use client";

import CfgiCard from "@/components/widgets/cfgi/detailed-cfgi/detailed-cfgi-chart";
import { useReadCfgiData, useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "../../shared/coin-dropdown";
import { useMemo, useState } from "react";
import PeriodDropdown from "../../shared/period-dropdown";
import { CfgiPeriods, TabOptions } from "@/constant/cfgi-data";
import { Skeleton } from "@/components/ui/skeleton";
import ChartLegend from "../../shared/chart-legend";
import SimpleCfgiChart from "./simple-cfgi-chart";

const colorToCfgi = [
  {
    label: "Crypto Fear & Greed Index",
    color: "#008000",
  },
];

export default function SimpleCfgiWidget() {
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

  const [chartViewOptions] = useState(TabOptions[1].value);

  return (
    <>
      <div className="flex flex-col justify-center w-full h-full rounded-sm ">
        <div className="px-3 py-4">
          {coinData ? (
            <div className="flex items-center justify-between">
              <CoinDropdown
                options={coinData || []}
                value={activeCoin}
                setValue={(coin: string) => {
                  setActiveCoin(coin);
                }}
                title="Simplified Fear and Greed Chart"
              />
              <div className="flex items-center gap-2">
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
            <SimpleCfgiChart cfgiData={data} viewOption={chartViewOptions} />
          ) : (
            <Skeleton className="w-full h-full bg-widget-background-200" />
          )}
        </div>

        <div className="flex items-center justify-center gap-5 py-3">
          <ChartLegend colorOptions={colorToCfgi} />
        </div>
      </div>
    </>
  );
}
