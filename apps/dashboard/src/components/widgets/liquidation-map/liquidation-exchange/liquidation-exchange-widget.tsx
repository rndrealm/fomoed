"use client";

import {
  useFetchLiquidDataMerged,
  useGetSupportedxchangePairs,
  useReadCoinList,
} from "@/services/queries/charts";
import CoinDropdown from "../../shared/coin-dropdown";
import { useEffect, useMemo, useState } from "react";
import PeriodDropdown from "../../shared/period-dropdown";
import { liquidTimeframeOptions } from "@/constant/cfgi-data";
import { Skeleton } from "@/components/ui/skeleton";
import ChartLegend from "../../shared/chart-legend";
import { ExchangePairOption } from "@/charts/types";
import PairDropdown from "../../shared/pair-dropdown";
import LiquidationChart from "../liquidation/liquidation-chart";

const colorToCfgi = [
  {
    label: "100x leverage",
    color: "#F56630",
  },
  {
    label: "50x leverage",
    color: "#21AA94",
  },
  {
    label: "25x leverage",
    color: "#7382DA",
  },
];

export default function LiquidationExchangeWidget() {
  const [activePeriod, setActivePeriod] = useState<string>(
    liquidTimeframeOptions[0].value
  );
  const [activeCoin, setActiveCoin] = useState<string>("BTC");
  const { data: coinData } = useReadCoinList();

  const { data: pairsData } = useGetSupportedxchangePairs();

  const [selectedPair, setSelectedPair] = useState<ExchangePairOption>(
    pairsData?.[0]
  );

  useEffect(() => {
    if (!pairsData || selectedPair) return;
    setSelectedPair(pairsData[0]);
  }, [pairsData]);

  const filteredData = useMemo(() => {
    if (!pairsData) return [];
    return pairsData.filter((i) => i.value.baseAsset === activeCoin);
  }, [pairsData, activeCoin]);

  const { data: liquidationData } = useFetchLiquidDataMerged(
    activePeriod,
    selectedPair?.value.baseAsset
  );
  console.log(liquidationData);

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
                  const newPairs = pairsData.filter(
                    (i) => i.value.baseAsset === coin
                  );
                  setSelectedPair(newPairs[0]);
                }}
                title="Exchange Liquidation Map"
              />
              <div className="flex items-center gap-2">
                <PeriodDropdown
                  options={liquidTimeframeOptions}
                  value={activePeriod}
                  setValue={(value: string) => {
                    setActivePeriod(value);
                  }}
                />
                <PairDropdown
                  options={filteredData}
                  value={selectedPair}
                  setValue={(value) => {
                    setSelectedPair(value);
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex-grow mx-3 ">
          {liquidationData ? (
            <LiquidationChart liquidationData={liquidationData} />
          ) : (
            <Skeleton className="w-full h-full bg-widget-background-200" />
          )}
        </div>

        <div className="flex items-center justify-center gap-5 border-t border-t-[#333] py-3">
          <ChartLegend colorOptions={colorToCfgi} />
        </div>
      </div>
    </>
  );
}
