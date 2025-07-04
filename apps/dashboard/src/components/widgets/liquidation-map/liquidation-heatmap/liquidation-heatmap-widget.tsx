"use client";

import { useFetchLiquidHeatMapData, useGetSupportedxchangePairs, useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "../../shared/coin-dropdown";
import { useEffect, useMemo, useRef, useState } from "react";
import PeriodDropdown from "../../shared/period-dropdown";
import { liquidHeatMapTimeframeOptions } from "@/constant/cfgi-data";
import { Skeleton } from "@/components/ui/skeleton";
import ChartLegend from "../../shared/chart-legend";
import PairDropdown from "../../shared/pair-dropdown";
import { ExchangePairOption } from "@/charts/types";
import LiquidationHeatmapChart from "./liquidation-heatmap-chart";
import { cn } from "@/lib/utils";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { exchangePairDefault } from "@/lib/static";
import WidgetHeader from "../../shared/widget-header";
import PremiumOverlay from "../../shared/premium-overlay";
import CameraAndRefresh from "../../shared/camera-and-refresh";
import { FullScreen } from "@/components/icons/icons";
import WidgetModalWrapper from "@/components/modals/widget-modal";

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
interface IProps {
  widget: LayoutType["widgets"][0];
  fullScreenButton?: boolean;
}

export default function LiquidationHeatmapWidget(props: IProps) {
  const { widget } = props;
  const { data: coinData } = useReadCoinList();

  const { data: pairsData } = useGetSupportedxchangePairs();

  const selectedPair = useMemo(() => {
    return pairsData.find((pr) => pr.label === widget.props?.exchange_token);
  }, [pairsData, widget.props?.exchange_token]);

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  useEffect(() => {
    if (!pairsData?.length || selectedPair) return;
    updateWidgetPropsFromAtom({
      tabId: activeLayout.id,
      widgetId: widget.id,
      widgetProps: { ...widget.props, exchange_token: pairsData[0].label },
    });
  }, [pairsData, selectedPair, activeLayout.id, updateWidgetPropsFromAtom, widget.id, widget.props]);

  const filteredData = useMemo(() => {
    if (!pairsData) return [];
    return pairsData.filter((i) => i.value.baseAsset === widget.props?.token);
  }, [pairsData, widget.props?.token]);

  const {
    data: liquidationData,
    isFetching,
    refetch,
  } = useFetchLiquidHeatMapData(widget.props?.period, selectedPair?.value.exchange, selectedPair?.value.symbol);
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
            <div className="py-4">
              {coinData && filteredData?.length > 0 ? (
                <div className="flex items-center justify-between">
                  <CoinDropdown
                    options={coinData || []}
                    value={widget.props?.token}
                    setValue={(coin: string) => {
                      // setActiveCoin(coin);
                      const newPairs = pairsData.filter((i) => i.value.baseAsset === coin);
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
                    title="Liquidation Heatmap"
                  />
                  <div className="flex items-center gap-2">
                    <PairDropdown
                      options={filteredData}
                      value={selectedPair || exchangePairDefault}
                      setValue={(value) => {
                        updateWidgetPropsFromAtom({
                          tabId: activeLayout.id,
                          widgetId: widget.id,
                          widgetProps: {
                            ...widget.props,
                            exchange_token: value.label,
                          },
                        });
                      }}
                    />
                    <PeriodDropdown
                      options={liquidHeatMapTimeframeOptions}
                      value={widget.props?.period || liquidHeatMapTimeframeOptions[0].value}
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
                      file="Liquidation Heatmap Chart.png"
                      refetch={refetch}
                    />
                  </div>
                </div>
              ) : null}
            </div>
            <PremiumOverlay>
              <div className="mx-3 flex-grow">
                {liquidationData ? (
                  <LiquidationHeatmapChart liquidationData={liquidationData} />
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
