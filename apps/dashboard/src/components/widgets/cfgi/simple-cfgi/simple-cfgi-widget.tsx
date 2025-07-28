"use client";

import { useReadCfgiData, useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "../../shared/coin-dropdown";
import { useMemo, useRef, useState } from "react";
import PeriodDropdown from "../../shared/period-dropdown";
import { CFGI_SUPPORTED_PERIODS_ENUM, CfgiPeriods, TabOptions } from "@/constant/cfgi-data";
import { Skeleton } from "@/components/ui/skeleton";
import ChartLegend from "../../shared/chart-legend";
import SimpleCfgiChart from "./simple-cfgi-chart";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import WidgetHeader from "../../shared/widget-header";
import CameraAndRefresh from "../../shared/camera-and-refresh";
import WidgetModalWrapper from "@/components/modals/widget-modal";
import { FullScreen } from "@/components/icons/icons";

const colorToCfgi = [
  {
    label: "Crypto Fear & Greed Index",
    color: "#008000",
  },
];

interface IProps {
  widget: LayoutType["widgets"][0];
  fullScreenButton?: boolean
}

export default function SimpleCfgiWidget(props: IProps) {
  const { widget } = props;
  const { data: coinData } = useReadCoinList();

  const activeCoinSlug = useMemo(() => {
    return coinData?.find((coin) => coin.symbol === widget.props?.token)?.slug;
  }, [widget.props?.token, coinData]);
  const { data, isFetching, refetch } = useReadCfgiData(widget.props?.token, widget.props?.period, activeCoinSlug);

  const chartRef = useRef<HTMLDivElement>(null);

  const [chartViewOptions] = useState(TabOptions[1].value);

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  const { fullScreenButton } = props;
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <WidgetModalWrapper widget={widget} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen}>

      <div
        className="flex h-full flex-col gap-4 rounded-2xl border border-[#1b1b1b] bg-[#080808] px-6 py-3"
        ref={chartRef}
      >
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="grid items-center w-full grid-cols-3">
            <WidgetHeader widget={widget} />
          </div>
          <div className="relative flex flex-col justify-center w-full h-full rounded-sm">
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
                    title="Simplified Fear and Greed Chart"
                  />
                  <div className="flex items-center gap-2">
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
                      file="Simplified Fear and Greed Chart.png"
                      refetch={refetch}
                    />
                  </div>
                </div>
              ) : null}
            </div>
            {/* <PremiumOverlay> */}
            <div className="flex-grow mx-3">
              {data ? (
                <SimpleCfgiChart cfgiData={data} viewOption={chartViewOptions} />
              ) : (
                <Skeleton className="w-full h-full bg-widget-background-200" />
              )}
            </div>

            <div className="flex items-center justify-center gap-5 py-3">
              <ChartLegend colorOptions={colorToCfgi} />
            </div>
            {/* </PremiumOverlay> */}
          </div>
        </div>

        {fullScreenButton && (
          <div

            className="absolute bottom-[16px] right-[9px] w-[28px] h-[28px] rounded-md z-[9] border border-[#1c1c1c]"
            style={{
              background:
                "linear-gradient(180deg, #1b1b1b 0%, rgba(0, 0, 0, 0.38) 72.15%)",
              backdropFilter: "blur(7px)",
              opacity: isFullscreen ? 0 : 1,
            }}
          >
            <button
              className="flex items-center justify-center w-full h-full"
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
