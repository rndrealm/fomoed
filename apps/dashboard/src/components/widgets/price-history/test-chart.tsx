"use client";
import React, { FC, ReactNode, useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  Chart,
  LineSeries,
  SeriesApiRef,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import {
  CandlestickData,
  ColorType,
  Coordinate,
  LineData,
  LineType,
  MouseEventParams,
  Time,
} from "lightweight-charts";
import { RenderIf } from "@/components/shared";
import {
  useFetchBinancePriceData,
  useFetchBinanceTokens,
} from "@/services/queries/charts";
import { formatChartTooltipDate, formatPriceSignificant } from "@/lib/utils";

interface ITooltip {
  x: number | null;
  y: number | null;
  show: boolean;
  children: ReactNode;
  width: number;
  height: number;
}

interface IProps {
  isCandleStick: boolean;
  token?: string;
  period?: string;
}

const toolTipWidth = 240;
const toolTipHeight = 24;
const toolTipMargin = 25;

export default function TestChart(props: IProps) {
  const { isCandleStick, period, token } = props;
  const { data = [], refetch } = useFetchBinancePriceData(
    `${token}USDT`,
    period
  );

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const lineSeriesRef = useRef<SeriesApiRef<"Line">>(null);
  const candleSeriesRef = useRef<SeriesApiRef<"Candlestick">>(null);

  const onCrosshairMove = (param: MouseEventParams<Time>) => {
    const container = chartContainerRef.current!;
    const tooltip = tooltipRef.current!;

    if (
      !param.point ||
      !param.time ||
      param.point.x < 0 ||
      param.point.x > container.clientWidth ||
      param.point.y < 0 ||
      param.point.y > container.clientHeight
    ) {
      tooltip.style.display = "none";
      return;
    }

    const data = {
      value: 0,
      time: Date.now(),
    };
    let coordinate: Coordinate | null | undefined;

    if (lineSeriesRef.current) {
      const seriesApi = lineSeriesRef.current.api();
      if (seriesApi) {
        const res = param.seriesData.get(seriesApi) as LineData;
        data.time = res.time as number;
        data.value = res.value;
        coordinate = lineSeriesRef.current.api()?.priceToCoordinate(data.value);
      }
    }

    if (candleSeriesRef.current) {
      const seriesApi = candleSeriesRef.current.api();

      if (seriesApi) {
        const res = param.seriesData.get(seriesApi) as CandlestickData;
        data.time = res.time as number;
        data.value = res.close;
        coordinate = candleSeriesRef.current
          .api()
          ?.priceToCoordinate(data.value);
      }
    }

    tooltip.style.display = "flex";
    tooltip.innerHTML = `
          <div style="background: #1C1C1C; border-radius: 8px; padding: 3px 6px">
            <p style="color: #878787; font-size: 13px; line-height: 135%; font-weight: 600"><span style="color: #ffffff; font-weight: 700;">${formatPriceSignificant(data.value)}</span> ${formatChartTooltipDate(data.time * 1000)}</p>
          </div>
        `;

    if (!coordinate) return;

    let shiftedCoordinate = param.point.x - toolTipWidth / 2;
    shiftedCoordinate = Math.max(
      0,
      Math.min(container.clientWidth - toolTipWidth, shiftedCoordinate)
    );

    const coordinateY =
      coordinate - toolTipHeight - toolTipMargin > 0
        ? coordinate - toolTipHeight - toolTipMargin
        : coordinate + toolTipMargin;

    tooltip.style.left = `${shiftedCoordinate}px`;
    tooltip.style.top = `${coordinateY}px`;
  };

  // const len = data?.length;
  // const from = data[len - 20]?.time as Time;
  // const to = data[len - 1]?.time as Time;

  useEffect(() => {
    if (!token || !period) return;

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${token.toLowerCase()}usdt@kline_${period}`
    );

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const k = msg.k;

      const newData = {
        time: Math.floor(k.t / 1000),
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        value: parseFloat(k.c),
      };

      if ((lineSeriesRef.current || candleSeriesRef.current) && data?.length) {
        if (isCandleStick) {
          candleSeriesRef.current?.api()?.update(newData as any);
        } else {
          lineSeriesRef?.current?.api()?.update(newData as any);
        }
      }
    };

    return () => {
      ws.close();
    };
  }, [token, period, data, isCandleStick]);

  return (
    // <div className="flex-1 relative">
    <div
      ref={chartContainerRef}
      style={{ width: "100%", height: "100%" }}
      className="app_line_chart_component flex-1 relative"
    >
      <Chart
        options={{
          layout: {
            background: { type: ColorType.Solid, color: "transparent" },
            attributionLogo: false,
            textColor: "#C3C3C3",
          },
          grid: {
            horzLines: {
              visible: false,
            },
            vertLines: {
              visible: false,
            },
          },
          rightPriceScale: {
            visible: isCandleStick,
          },
          autoSize: true,
        }}
        containerProps={{
          style: {
            height: "100%",
          },
        }}
        onCrosshairMove={onCrosshairMove}
      >
        <RenderIf condition={!isCandleStick}>
          <LineSeries
            ref={lineSeriesRef}
            options={{
              color: "#fff",
              lineType: LineType.Curved,
            }}
            data={data as any}
            reactive
          />
        </RenderIf>

        <RenderIf condition={isCandleStick}>
          <CandlestickSeries ref={candleSeriesRef} data={data as any} />
        </RenderIf>
        <TimeScale
          options={{
            borderColor: "transparent",
            tickMarkFormatter: (time: number) => {
              const date = new Date(time * 1000); // time is in seconds
              const day = date.getDate();
              const month = date
                .toLocaleString("en-US", { month: "short" })
                .toUpperCase(); // e.g., MAR

              return `${day} ${month}`;
            },
          }}
          // visibleRange={data?.length === 0 ? undefined : { from, to }}
        >
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
      <div
        ref={tooltipRef}
        className="absolute w-[240px] h-[24px] top-0 left-0 z-[9] overflow-visible whitespace-nowrap pointer-events-none"
      ></div>
    </div>

    // </div>
  );
}
