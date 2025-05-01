"use client";

import { useReadCfgiData, useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "../../shared/coin-dropdown";
import { useMemo, useState } from "react";
import PeriodDropdown from "../../shared/period-dropdown";
import { CfgiPeriods, TabOptions } from "@/constant/cfgi-data";
import { Skeleton } from "@/components/ui/skeleton";
import ChartLegend from "../../shared/chart-legend";
import DetailedCfgiChart from "@/components/widgets/cfgi/detailed-cfgi/detailed-cfgi-chart";
import ChartTab from "../../shared/chart-tab";
import { cn } from "@/lib/utils";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  activeTabAtom,
  layoutAtom,
  LayoutType,
  updateWidgetTokenAtom,
} from "@/lib/atoms/layoutAtom";

// const colorToCfgi = {
//   25: "#FF3B10",
//   50: "#EA9924",
//   75: "#399F57",
//   100: "#05A5A6",
// };

const colorToCfgi = [
  {
    label: "0-25",
    color: "#FF3B10",
  },
  {
    label: "25-50",
    color: "#EA9924",
  },
  {
    label: "50-75",
    color: "#399F57",
  },
  {
    label: "75-100",
    color: "#05A5A6",
  },
];

interface IProps {
  isEmbed?: boolean;
  symbol?: string | null;
  widget: LayoutType["widgets"][0];
}

export default function DetailedCfgiWidget(props: IProps) {
  const { isEmbed, symbol = null, widget } = props;
  const [activePeriod, setActivePeriod] = useState<string>(
    CfgiPeriods[0].value
  );
  // const [activeCoin, setActiveCoin] = useState<string>(symbol || "BTC");
  const { data: coinData } = useReadCoinList();

  const activeCoinSlug = useMemo(() => {
    return coinData?.find((coin) => coin.symbol === widget.token)?.slug;
  }, [widget.token, coinData]);
  const { data } = useReadCfgiData(
    widget.token,
    activePeriod,
    activeCoinSlug || ""
  );

  const [chartViewOptions, setChartViewOptions] = useState(TabOptions[1].value);
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
                  updateWidgetTokenFromAtom({
                    tabId: activeLayout.id,
                    widgetId: widget.id,
                    token: coin,
                  });
                }}
                title="Fear and Greed Chart"
              />
              <div className="flex items-center gap-2">
                <ChartTab
                  value={chartViewOptions}
                  setValue={(val) => {
                    setChartViewOptions(val);
                  }}
                />
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
            <DetailedCfgiChart cfgiData={data} viewOption={chartViewOptions} />
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
