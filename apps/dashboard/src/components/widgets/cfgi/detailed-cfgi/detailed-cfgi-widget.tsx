"use client";

import { useReadCfgiData, useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "../../shared/coin-dropdown";
import { useMemo, useRef } from "react";
import PeriodDropdown from "../../shared/period-dropdown";
import { CFGI_SUPPORTED_PERIODS_ENUM, CfgiPeriods } from "@/constant/cfgi-data";
import { Skeleton } from "@/components/ui/skeleton";
import ChartLegend from "../../shared/chart-legend";
import DetailedCfgiChart from "@/components/widgets/cfgi/detailed-cfgi/detailed-cfgi-chart";
import ChartTab from "../../shared/chart-tab";
import { cn } from "@/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import CameraAndRefresh from "../../shared/camera-and-refresh";
import WidgetHeader from "../../shared/widget-header";

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

  const { data: coinData } = useReadCoinList();

  const activeCoinSlug = useMemo(() => {
    return coinData?.find((coin) => coin.symbol === widget.props?.token)?.slug;
  }, [widget.props?.token, coinData]);

  const { data, refetch, isFetching } = useReadCfgiData(widget.props?.token, widget.props?.period, activeCoinSlug);

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="flex h-full flex-col gap-4 rounded-2xl border border-[#1b1b1b] bg-[#080808] px-6 py-3"
      ref={chartRef}
    >
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="grid items-center w-full grid-cols-3">
          <WidgetHeader widget={widget} />
        </div>
        <div className={cn("flex h-full w-full flex-col justify-center rounded-sm")}>
          <div className="py-4">
            {coinData ? (
              <div className="flex items-center justify-between">
                <CoinDropdown
                  options={coinData || []}
                  value={widget.props?.token}
                  setValue={(coin: string) => {
                    updateWidgetPropsFromAtom({
                      tabId: activeLayout.id,
                      widgetId: widget.id,
                      widgetProps: { ...widget.props, token: coin },
                    });
                  }}
                  title="Fear and Greed Chart"
                />
                <div className="flex items-center gap-2">
                  <ChartTab
                    value={widget.props?.sentiment_tab || "both"}
                    setValue={(val) => {
                      updateWidgetPropsFromAtom({
                        tabId: activeLayout.id,
                        widgetId: widget.id,
                        widgetProps: { ...widget.props, sentiment_tab: val },
                      });
                    }}
                  />
                  <PeriodDropdown
                    options={CfgiPeriods}
                    value={widget.props?.period || (CFGI_SUPPORTED_PERIODS_ENUM.DAY1 as string)}
                    setValue={(value: string) => {
                      updateWidgetPropsFromAtom({
                        tabId: activeLayout.id,
                        widgetId: widget.id,
                        widgetProps: { ...widget.props, period: value },
                      });
                    }}
                  />
                  <CameraAndRefresh
                    isFetching={isFetching}
                    chartRef={chartRef}
                    file="Detailed Fear and Greed Chart.png"
                    refetch={refetch}
                  />
                </div>
              </div>
            ) : null}
          </div>
          <div className="h-full mx-3">
            {data ? (
              <DetailedCfgiChart cfgiData={data} viewOption={widget.props?.sentiment_tab || "both"} />
            ) : (
              <Skeleton className="w-full h-full bg-widget-background-200" />
            )}
          </div>

          <div className="flex items-center justify-center gap-5 py-3">
            <ChartLegend colorOptions={colorToCfgi} />
          </div>
        </div>
      </div>
    </div>
  );
}
