import { useQuery } from "@tanstack/react-query";

import api from "../../api";
import {
  BinanceKlineFormatted,
  BinanceKlineRaw,
  CfgiDataResponse,
  CoinListResponse,
  FormatLiquidationDataResult,
  LiquidExchangeResponse,
  LiquidHeatmapResponse,
  LiquidMapDataResponse,
  SupportedPairsData,
  Ticker,
} from "./types";
import { supportedExchangePairsToOptions } from "@/lib/utils";
import { ExchangePairOption } from "@/charts/types";
import { formatLiquidationData, formatMergetLiquidMapData } from "./helpers";

export const useReadCfgiData = (
  token?: string,
  period?: string,
  token_slug?: string
) => {
  const hash = ["cfgi", token, period, token_slug];
  const { data, isPending, error, isSuccess } = useQuery<CfgiDataResponse[]>({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/cfgi?token=${token}&period=${period}&values=1200&token_slug=${token_slug}`,
      });
      return response.data;
    },
    enabled: !!token && !!period && !!token_slug,
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};

export const useReadCoinList = (summary = false) => {
  const hash = ["coin-list"];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: "https://api.coin-stats.com/v4/coins?skip=0&limit=2500",
      });
      return response as unknown as CoinListResponse;
    },
    refetchOnMount: summary ? "always" : false,
    refetchOnReconnect: summary ? "always" : false,
    refetchOnWindowFocus: summary ? "always" : false,
  });

  let returnData = data?.coins.map((coin) => {
    return {
      price: coin.pu,
      priceChange: coin.p24,
      marketCap: coin.m,
      volume: coin.v,
      icon: coin.ic,
      symbol: coin.s,
      name: coin.n,
      color: coin.c,
      slug: coin.i,
      is_free: coin.i === "bitcoin" || coin.i === "ethereum",
    };
  });

  if (summary) {
    returnData = returnData?.sort((a, b) => b.priceChange - a.priceChange);
  }
  return {
    data: returnData,
    isPending,
    isSuccess,
    error,
  };
};

export const useGetSupportedxchangePairs = () => {
  const hash = ["get-exchange-pairs"];
  const { data, isPending, error, isSuccess } = useQuery<SupportedPairsData>({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/supported-exchange-pairs`,
      });
      return response.data;
    },
  });

  let options: ExchangePairOption[] = [];
  if (data) {
    options = supportedExchangePairsToOptions(data);
  }

  return {
    data: options,
    isPending,
    isSuccess,
    error,
  };
};

export const useFetchLiquidMapData = (
  timeframe?: string,
  exchange?: string,
  instrumentId?: string,
  baseAsset?: string,
  quoteAsset?: string
) => {
  const hash = [
    "get-liquid-map",
    timeframe,
    exchange,
    instrumentId,
    baseAsset,
    quoteAsset,
  ];
  const { data, isPending, error, isSuccess } = useQuery<LiquidMapDataResponse>(
    {
      queryKey: hash,
      queryFn: async () => {
        const response = await api.get({
          url: `/api/liq-map?timeframe=${timeframe}&exchange=${exchange}&instrumentId=${instrumentId}&baseAsset=${baseAsset}&quoteAsset=${quoteAsset}`,
        });
        return response.data;
      },
      enabled:
        !!timeframe &&
        !!exchange &&
        !!instrumentId &&
        !!baseAsset &&
        !!quoteAsset,
    }
  );
  let returnData: FormatLiquidationDataResult | undefined = undefined;
  if (data) {
    returnData = formatLiquidationData(data);
  }
  return {
    data: returnData,
    isPending,
    isSuccess,
    error,
  };
};

export const useFetchLiquidHeatMapData = (
  timeframe?: string,
  exchange?: string,
  symbol?: string
) => {
  const hash = ["get-liquid-heat-map", timeframe, exchange, symbol];
  const { data, isPending, error, isSuccess } = useQuery<LiquidHeatmapResponse>(
    {
      queryKey: hash,
      queryFn: async () => {
        const response = await api.get({
          url: `/api/liq-heatmap?timeframe=${timeframe}&exchange=${exchange}&symbol=${symbol}`,
        });
        console.log("response", response);
        return response.data;
      },
      enabled: !!timeframe && !!exchange && !!symbol,
    }
  );

  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};
export const useFetchLiquidDataMerged = (
  timeframe?: string,
  asset?: string
) => {
  const hash = ["get-liquid-exchange-map", timeframe, asset];
  const { data, isPending, error, isSuccess } =
    useQuery<LiquidExchangeResponse>({
      queryKey: hash,
      queryFn: async () => {
        const response = await api.get({
          url: `/api/ex-liq-map?timeframe=${timeframe}&asset=${asset}`,
        });
        console.log("response", response);
        return response.data;
      },
      enabled: !!timeframe && !!asset,
    });
  let resData: FormatLiquidationDataResult | null = null;
  if (data) {
    resData = formatMergetLiquidMapData(data);
  }

  return {
    data: resData,
    isPending,
    isSuccess,
    error,
  };
};

export const useFetchBinancePriceData = (
  symbol?: string, // e.g., 'BTCUSDT'
  interval?: string, // e.g., '1h', '1d'
  limit: number = 100 // Number of candles (max 1000)
) => {
  const queryKey = ["binance-price", symbol, interval, limit];

  const res = useQuery<unknown>({
    queryKey,
    queryFn: async () => {
      const response = await api.get({
        url: `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      });

      return response;
    },
    enabled: !!symbol && !!interval,
  });

  const transformedData: BinanceKlineFormatted[] | undefined = (
    res.data as BinanceKlineRaw[]
  )?.map(([time, open, high, low, close]) => ({
    time: Math.floor(time / 1000),
    open: parseFloat(open),
    high: parseFloat(high),
    low: parseFloat(low),
    close: parseFloat(close),
    value: parseFloat(close),
  }));

  return {
    ...res,
    data: transformedData,
  };
};

export const useFetchTopGainerLoser = () => {
  const queryKey = ["binance-top-gainer-loser"];

  const res = useQuery<unknown>({
    queryKey,
    queryFn: async () => {
      const response = await api.get({
        url: `https://api.binance.com/api/v3/ticker/24hr`,
      });

      return response;
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
    // enabled: !!symbol && !!interval,
  });

  const usdtPairs =
    (res.data as Ticker[])
      ?.filter((item) => item.symbol.endsWith("USDT"))
      .filter((item) => parseFloat(item.quoteVolume) > 1000000) || [];

  const sorted = (usdtPairs || []).sort(
    (a, b) =>
      parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent)
  );

  const newData = {
    mover: sorted[0],
    loser: sorted[sorted.length - 1],
  };

  return {
    ...res,
    data: newData,
  };
};
