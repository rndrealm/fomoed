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
import { useAtomValue } from "jotai";
import { geoLocationAtom } from "@/lib/atoms/geoLocation";

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
    colors: { backgroundColor = "transparent", lineColor = "#2962FF", textColor = "#C3C3C3" } = {},
    token = "btc",
    period = "1d",
    isCandleStick = true,
  } = props;

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<ISeriesApi<any>>(null);
  const candleSeriesRef = useRef<ISeriesApi<any>>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const location = useAtomValue(geoLocationAtom);

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
          const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase(); // e.g., MAR

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

    // const len = data?.length;
    // const from = data[len - 20]?.time;
    // const to = data[len - 1]?.time;

    // if (from && to) {
    //   chart.timeScale().setVisibleRange({ from, to });
    // }

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

      const data = param.seriesData.get(isCandleStick ? candleSeries : areaSeries)! as any;
      const price = data.value ?? data.close;

      tooltip.style.display = "flex";
      tooltip.innerHTML = `
      <div style="background: #1C1C1C; border-radius: 8px; padding: 3px 6px">
        <p style="color: #878787; font-size: 13px; line-height: 135%; font-weight: 600"><span style="color: #ffffff; font-weight: 700;">${formatPriceSignificant(price)}</span> ${formatChartTooltipDate(data.time * 1000)}</p>
      </div>
    `;

      const coordinate = isCandleStick ? candleSeries.priceToCoordinate(price) : areaSeries.priceToCoordinate(price);
      if (coordinate === null) return;

      let shiftedCoordinate = param.point.x - toolTipWidth / 2;
      shiftedCoordinate = Math.max(0, Math.min(container.clientWidth - toolTipWidth, shiftedCoordinate));

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
    if (!token || !seriesRef.current || !period || !location?.country) return;

    const handleKlineUpdate = (klineData: any) => {
      if (!klineData) {
        console.warn("handleKlineUpdate received no data");
        return;
      }

      const candlestickData = {
        time: Math.floor(klineData.t / 1000),
        open: parseFloat(klineData.o),
        high: parseFloat(klineData.h),
        low: parseFloat(klineData.l),
        close: parseFloat(klineData.c),
        value: parseFloat(klineData.c),
      };

      if (seriesRef.current && data?.length) {
        if (isCandleStick && candleSeriesRef.current) {
          candleSeriesRef.current.update(candlestickData);
        } else {
          seriesRef.current.update(candlestickData);
        }
      }
    };

    const connectEventSourceProxy = () => {
      console.log("Primary Kline WebSocket failed. Attempting fallback to EventSource proxy...");
      const eventSource = new EventSource(`/api/websocket-proxy?token=${token}&streamType=kline&period=${period}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "heartbeat") return;

          const klineData = message.k || (message.data && message.data.k) || null;
          if (klineData) {
            handleKlineUpdate(klineData);
          }
        } catch (error) {
          console.error("Error parsing kline fallback message:", error);
        }
      };

      eventSource.onerror = (error) => {
        // console.error("Kline EventSource fallback also failed:", error);
        eventSource.close();
      };
    };

    const connectWebSocket = () => {
      const streamName = `${token.toLowerCase()}usdt@kline_${period}`;
      const endpoint =
        location.country === "US"
          ? `wss://stream.binance.us:9443/ws/${streamName}`
          : `wss://stream.binance.com:9443/ws/${streamName}`;

      const ws = new WebSocket(endpoint);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`Direct Kline WebSocket connection established for ${token} - ${period}. ✅`);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message && message.k) {
            handleKlineUpdate(message.k);
          }
        } catch (error) {
          console.error("Error parsing kline WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        // console.error("Direct Kline WebSocket connection error:", error);
        ws.close();
        connectEventSourceProxy();
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [token, period, data?.length, isCandleStick, location?.country]);

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
