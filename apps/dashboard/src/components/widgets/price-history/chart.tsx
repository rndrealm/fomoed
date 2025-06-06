import React, { Fragment, useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
  LineType,
  LineStyle,
  ISeriesApi,
  CandlestickSeries,
} from "lightweight-charts";
import { formatChartTooltipDate, formatPriceSignificant } from "@/lib/utils";

interface ChartColors {
  backgroundColor?: string;
  lineColor?: string;
  textColor?: string;
}

interface IProps {
  data: any[];
  colors?: ChartColors;
  token?: string;
  period?: string;
  isCandleStick?: boolean;
}

const Chart = (props: IProps) => {
  const {
    data,
    colors: {
      backgroundColor = "transparent",
      lineColor = "#2962FF",
      textColor = "#C3C3C3",
    } = {},
    token = "btc",
    period = "1d",
    isCandleStick = true,
  } = props;

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<ISeriesApi<any>>(null);
  const candleSeriesRef = useRef<ISeriesApi<any>>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
        attributionLogo: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      // height: 282,
      grid: {
        horzLines: {
          // color: "blue",
          style: LineStyle.Solid,
          visible: false,
        },
        vertLines: {
          visible: false,
        },
      },
      rightPriceScale: {
        visible: isCandleStick,
      },
      timeScale: {
        borderColor: "transparent",
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000); // time is in seconds
          const day = date.getDate();
          const month = date
            .toLocaleString("en-US", { month: "short" })
            .toUpperCase(); // e.g., MAR

          return `${day} ${month}`;
        },
      },
    });

    // chart.addSeries
    // const areaSeries = chart.addSeries(CandlestickSeries, {
    // downColor: "yellow",
    // upColor: "blue",
    // });

    const areaSeries = chart.addSeries(LineSeries, {
      color: "#fff",
      lineType: LineType.Curved,
    });

    const candleSeries = chart.addSeries(CandlestickSeries);

    if (isCandleStick) {
      candleSeries.setData(data);
    } else {
      areaSeries.setData(data);
    }

    seriesRef.current = areaSeries;
    candleSeriesRef.current = candleSeries;

    const len = data?.length;
    const from = data[len - 20]?.time;
    const to = data[len - 1]?.time;

    if (from && to) {
      chart.timeScale().setVisibleRange({ from, to });
    }

    const tooltip = tooltipRef.current!;
    const container = chartContainerRef.current!;

    const toolTipWidth = 240;
    const toolTipHeight = 24;
    const toolTipMargin = 25;

    chart.subscribeCrosshairMove((param) => {
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

      const data = param.seriesData.get(
        isCandleStick ? candleSeries : areaSeries
      )! as any;
      const price = data.value ?? data.close;

      console.log(formatChartTooltipDate(Date.now()));

      tooltip.style.display = "flex";
      tooltip.innerHTML = `
      <div style="background: #1C1C1C; border-radius: 8px; padding: 3px 6px">
        <p style="color: #878787; font-size: 13px; line-height: 135%; font-weight: 600"><span style="color: #ffffff; font-weight: 700;">${formatPriceSignificant(price)}</span> ${formatChartTooltipDate(data.time * 1000)}</p>
      </div>
    `;

      const coordinate = isCandleStick
        ? candleSeries.priceToCoordinate(price)
        : areaSeries.priceToCoordinate(price);
      if (coordinate === null) return;

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
    });
    // chart.timeScale().fitContent();

    const observer = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    });

    observer.observe(chartContainerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [data, backgroundColor, lineColor, textColor, isCandleStick]);

  useEffect(() => {
    if (!token || !seriesRef.current || !period) return;

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${token.toLowerCase()}usdt@kline_${period}`
    );

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const k = msg.k;

      const candlestickData = {
        time: Math.floor(k.t / 1000),
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        value: parseFloat(k.c),
      };

      if (seriesRef.current && data?.length) {
        // const lastIndex = seriesRef.current.data().length - 1;
        // const lastData =
        //   lastIndex >= 0 ? seriesRef.current.dataByIndex(lastIndex) : null;

        // if (lastData && candlestickData.time >= lastData.time) {
        //   seriesRef.current.update(candlestickData);
        // }
        if (isCandleStick) {
          candleSeriesRef.current?.update(candlestickData);
        } else {
          seriesRef.current.update(candlestickData);
        }
      }
    };

    return () => {
      ws.close();
    };
  }, [token, period, data, isCandleStick]);

  return (
    <div className="h-full w-full relative">
      <div
        ref={chartContainerRef}
        style={{ width: "100%", height: "100%" }}
        className="app_line_chart_component flex-1"
      />

      <div
        ref={tooltipRef}
        className="absolute top-[0] right-[0] w-[220px] h-[24px] hidden z-[9] justify-center overflow-visible whitespace-nowrap"
      ></div>
    </div>
  );
};

export const ChartComponent = React.memo(Chart);
