"use client";

import {
  useFetchLiquidHeatMapData,
  useGetSupportedxchangePairs,
  useReadCoinList,
} from "@/services/queries/charts";
import CoinDropdown from "../../shared/coin-dropdown";
import { useEffect, useMemo, useState } from "react";
import PeriodDropdown from "../../shared/period-dropdown";
import { liquidHeatMapTimeframeOptions } from "@/constant/cfgi-data";
import { Skeleton } from "@/components/ui/skeleton";
import ChartLegend from "../../shared/chart-legend";
import PairDropdown from "../../shared/pair-dropdown";
import { ExchangePairOption } from "@/charts/types";
import LiquidationHeatmapChart from "./liquidation-heatmap-chart";

const colorToCfgi = [
  {
    label: "Liquidation leverage",
    color: "#21AA94",
  },
  {
    label: "Supercharts",
    color: "#7382DA",
  },
];

export default function LiquidationHeatmapWidget() {
  const [activePeriod, setActivePeriod] = useState<string>(
    liquidHeatMapTimeframeOptions[0].value
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
  }, [pairsData, selectedPair]);

  const filteredData = useMemo(() => {
    if (!pairsData) return [];
    return pairsData.filter((i) => i.value.baseAsset === activeCoin);
  }, [pairsData, activeCoin]);

  const { data: liquidationData } = useFetchLiquidHeatMapData(
    activePeriod,
    selectedPair?.value.exchange,
    selectedPair?.value.symbol
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
                  const newPairs = pairsData.filter(
                    (i) => i.value.baseAsset === coin
                  );
                  setSelectedPair(newPairs[0]);
                }}
                title="Liquidity Heatmap"
              />
              <div className="flex items-center gap-2">
                <PairDropdown
                  options={filteredData}
                  value={selectedPair}
                  setValue={(value) => {
                    setSelectedPair(value);
                  }}
                />
                <PeriodDropdown
                  options={liquidHeatMapTimeframeOptions}
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
          {liquidationData ? (
            <LiquidationHeatmapChart liquidationData={liquidationData} />
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
