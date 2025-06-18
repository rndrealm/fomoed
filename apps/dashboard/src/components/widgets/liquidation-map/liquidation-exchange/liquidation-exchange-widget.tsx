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
import { cn } from "@/lib/utils";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { exchangePairDefault } from "@/lib/static";
import WidgetHeader from "../../shared/widget-header";
import PremiumOverlay from "../../shared/premium-overlay";

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
  widget: LayoutType["widgets"][0];
}

export default function LiquidationExchangeWidget(props: IProps) {
  const { widget } = props;
  const { data: coinData } = useReadCoinList();

  const { data: pairsData } = useGetSupportedxchangePairs();

  const { data: liquidationData } = useFetchLiquidDataMerged(
    widget.props?.period,
    widget.props?.token
  );

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  return (
    <div className="bg-[#080808] border border-[#1b1b1b] rounded-2xl px-6 py-3 flex flex-col gap-4 h-full">
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="grid items-center w-full grid-cols-3">
          <WidgetHeader widget={widget} />
        </div>
        <div
          className={cn(
            "flex flex-col justify-center w-full h-full rounded-sm relative"
          )}
        >
          <div className="px-3 py-4">
            {coinData ? (
              <div className="flex items-center justify-between">
                <CoinDropdown
                  options={coinData || []}
                  value={widget.props?.token}
                  setValue={(coin: string) => {
                    const newPairs = pairsData.filter(
                      (i) => i.value.baseAsset === coin
                    );
                    // setSelectedPair(newPairs[0]);
                    updateWidgetPropsFromAtom({
                      tabId: activeLayout.id,
                      widgetId: widget.id,
                      widgetProps: {
                        ...widget.props,
                        token: coin,
                        exchange_token: newPairs[0].label,
                      },
                    });
                  }}
                  title="Exchange Liquidation Map"
                />
                <div className="flex items-center gap-2">
                  <PeriodDropdown
                    options={liquidTimeframeOptions}
                    value={
                      widget.props?.period || liquidTimeframeOptions[0].value
                    }
                    setValue={(value: string) => {
                      updateWidgetPropsFromAtom({
                        tabId: activeLayout.id,
                        widgetId: widget.id,
                        widgetProps: { ...widget.props, period: value },
                      });
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>
          <PremiumOverlay>
            <div className="flex-grow mx-3 ">
              {liquidationData ? (
                <LiquidationChart liquidationData={liquidationData} />
              ) : (
                <Skeleton className="w-full h-full bg-widget-background-200" />
              )}
            </div>

            <div className="flex items-center justify-center gap-5 py-3">
              <ChartLegend colorOptions={colorToCfgi} />
            </div>
          </PremiumOverlay>
        </div>
      </div>
    </div>
  );
}
