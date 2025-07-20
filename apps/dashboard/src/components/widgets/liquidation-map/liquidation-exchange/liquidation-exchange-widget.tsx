"use client";

import { useFetchLiquidDataMerged, useGetSupportedxchangePairs, useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "../../shared/coin-dropdown";
import PeriodDropdown from "../../shared/period-dropdown";
import { liquidTimeframeOptions } from "@/constant/cfgi-data";
import { Skeleton } from "@/components/ui/skeleton";
import ChartLegend from "../../shared/chart-legend";
import LiquidationChart from "../liquidation/liquidation-chart";
import { cn } from "@/lib/utils";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import WidgetHeader from "../../shared/widget-header";
import PremiumOverlay from "../../shared/premium-overlay";
import CameraAndRefresh from "../../shared/camera-and-refresh";
import { useRef, useState } from "react";
import WidgetModalWrapper from "@/components/modals/widget-modal";
import { FullScreen } from "@/components/icons/icons";

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
  fullScreenButton?: boolean;
}

export default function LiquidationExchangeWidget(props: IProps) {
  const { widget } = props;
  const { data: coinData } = useReadCoinList();

  const { data: pairsData } = useGetSupportedxchangePairs();

  const {
    data: liquidationData,
    isFetching,
    refetch,
  } = useFetchLiquidDataMerged(widget.props?.period, widget.props?.token);

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);
  const chartRef = useRef<HTMLDivElement>(null);

  const { fullScreenButton } = props;

  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <WidgetModalWrapper widget={widget} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen}>
      <div
        className="flex h-full flex-col gap-4 rounded-2xl border border-[#1b1b1b] bg-[#080808] px-6 py-3"
        ref={chartRef}
      >
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="grid w-full grid-cols-3 items-center">
            <WidgetHeader widget={widget} />
          </div>
          <div className={cn("relative flex h-full w-full flex-col justify-center rounded-sm")}>
            <div className="px-3 py-4">
              {coinData ? (
                <div className="flex items-center justify-between">
                  <CoinDropdown
                    options={coinData || []}
                    value={widget.props?.token}
                    setValue={(coin: string) => {
                      const newPairs = pairsData.filter((i) => i.value.base_asset === coin);
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
                      value={widget.props?.period || liquidTimeframeOptions[0].value}
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
                      file="Exchange Liquidation Map Chart.png"
                      refetch={refetch}
                    />
                  </div>
                </div>
              ) : null}
            </div>
            <PremiumOverlay>
              <div className="mx-3 flex-grow">
                {liquidationData ? (
                  <LiquidationChart liquidationData={liquidationData} />
                ) : (
                  <Skeleton className="bg-widget-background-200 h-full w-full" />
                )}
              </div>

              <div className="flex items-center justify-center gap-5 py-3">
                <ChartLegend colorOptions={colorToCfgi} />
              </div>
            </PremiumOverlay>
          </div>
        </div>

        {fullScreenButton && (
          <div
            className="absolute right-[9px] bottom-[16px] z-[9] h-[28px] w-[28px] rounded-md border border-[#1c1c1c]"
            style={{
              background: "linear-gradient(180deg, #1b1b1b 0%, rgba(0, 0, 0, 0.38) 72.15%)",
              backdropFilter: "blur(7px)",
              opacity: isFullscreen ? 0 : 1,
            }}
          >
            <button
              className="flex h-full w-full items-center justify-center"
              onClick={() => {
                setIsFullscreen(true);
              }}
            >
              <FullScreen />
            </button>
          </div>
        )}
      </div>
    </WidgetModalWrapper>
  );
}
