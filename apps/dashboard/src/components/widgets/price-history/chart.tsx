import React, { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
  LineType,
  LineStyle,
  ISeriesApi,
} from "lightweight-charts";

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
  } = props;

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<ISeriesApi<any>>(null);

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
        visible: false,
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

    // const _areaSeries = chart.addAreaSeries({
    //   lineColor,
    //   topColor: areaTopColor,
    //   bottomColor: areaBottomColor,
    // });

    areaSeries.setData(data);
    seriesRef.current = areaSeries;
    const len = data?.length;
    const from = data[len - 20]?.time;
    const to = data[len - 1]?.time;

    if (from && to) {
      chart.timeScale().setVisibleRange({ from, to });
    }
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
  }, [data, backgroundColor, lineColor, textColor]);

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
        seriesRef.current.update(candlestickData);
      }
    };

    return () => {
      ws.close();
    };
  }, [token, period, data]);

  return (
    <div
      ref={chartContainerRef}
      style={{ width: "100%", height: "100%" }}
      className="app_line_chart_component flex-1"
    />
  );
};

export const ChartComponent = React.memo(Chart);
