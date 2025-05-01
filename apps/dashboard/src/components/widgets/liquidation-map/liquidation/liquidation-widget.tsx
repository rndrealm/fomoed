"use client";

import {
  useFetchLiquidMapData,
  useGetSupportedxchangePairs,
  useReadCoinList,
} from "@/services/queries/charts";
import CoinDropdown from "../../shared/coin-dropdown";
import { useEffect, useMemo, useState } from "react";
import PeriodDropdown from "../../shared/period-dropdown";
import { LiquidTabOptions, liquidTimeframeOptions } from "@/constant/cfgi-data";
import { Skeleton } from "@/components/ui/skeleton";
import ChartLegend from "../../shared/chart-legend";
import LiquidationChart from "./liquidation-chart";
import { ExchangePairOption } from "@/charts/types";
import PairDropdown from "../../shared/pair-dropdown";
import { cn } from "@/lib/utils";
import {
  activeTabAtom,
  LayoutType,
  updateWidgetTokenAtom,
} from "@/lib/atoms/layoutAtom";
import { useAtomValue, useSetAtom } from "jotai";

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

interface IProps {
  widget: LayoutType["widget"][0];
  isEmbed?: boolean;
  symbol?: string | null;
}

export default function LiquidationWidget(props: IProps) {
  const { isEmbed, symbol = null, widget } = props;
  const [activePeriod, setActivePeriod] = useState<string>(
    liquidTimeframeOptions[0].value
  );
  // const [activeCoin, setActiveCoin] = useState<string>(symbol || "BTC");
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
    return pairsData.filter((i) => i.value.baseAsset === widget.token);
  }, [pairsData, widget.token]);

  const { data: liquidationData } = useFetchLiquidMapData(
    activePeriod,
    selectedPair?.value.exchange,
    selectedPair?.value.instrumentId,
    selectedPair?.value.baseAsset,
    selectedPair?.value.quoteAsset
  );

  const [chartViewOptions] = useState(LiquidTabOptions[1].value);

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetTokenFromAtom = useSetAtom(updateWidgetTokenAtom);

  return (
    <>
      <div
        className={cn("flex flex-col justify-center w-full h-full rounded-sm")}
      >
        <div className="px-3 py-4">
          {coinData ? (
            <div className="flex items-center justify-between">
              <CoinDropdown
                options={coinData || []}
                value={widget.token}
                setValue={(coin: string) => {
                  const newPairs = pairsData.filter(
                    (i) => i.value.baseAsset === coin
                  );
                  setSelectedPair(newPairs[0]);
                  updateWidgetTokenFromAtom({
                    tabId: activeLayout.id,
                    widgetId: widget.id,
                    token: coin,
                  });
                }}
                title="Liquidation Map"
              />
              <div className="flex items-center gap-2">
                {/* <ChartTab
                  value={chartViewOptions}
                  setValue={(val) => {
                    setChartViewOptions(val);
                  }}
                /> */}
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
            <LiquidationChart
              liquidationData={liquidationData}
              viewOption={chartViewOptions}
            />
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
