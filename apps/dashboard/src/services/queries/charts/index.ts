import { useQuery } from "@tanstack/react-query";

import api from "../../api";
import {
  BinanceKlineFormatted,
  BinanceKlineRaw,
  BinanceSymbolInfo,
  BinanceTicker,
  BtcDominanceResponse,
  CfgiDataResponse,
  CoinDataInterface,
  CoinListResponse,
  CoinStatsTokenInfo,
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
import axios from "axios";
import { fetchFearAndGreed } from "./actions";

export const useReadCfgiData = (token?: string, period?: string, token_slug?: string) => {
  const hash = ["cfgi", token, period, token_slug];
  const { data, isPending, error, isSuccess, refetch, isLoading, isFetching } = useQuery<CfgiDataResponse[]>({
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
    refetch,
    isLoading,
    isFetching,
  };
};

export const useReadCoinList = (summary = false) => {
  const hash = ["coin-list"];
  const { data, isPending, error, isSuccess } = useQuery<CoinStatsTokenInfo[]>({
    queryKey: hash,
    queryFn: async () => {
      const response = await axios.get("/api/coinstats-coins");
      return response.data;
    },
    refetchOnMount: summary ? "always" : false,
    refetchOnReconnect: summary ? "always" : false,
    refetchOnWindowFocus: summary ? "always" : false,
  });

  let returnData = data?.map((coin) => {
    return {
      price: coin.price,
      priceChange: coin.priceChange1d,
      marketCap: coin.marketCap,
      volume: coin.volume,
      icon: coin.icon,
      symbol: coin.symbol,
      name: coin.name,
      color: undefined, // CoinStatsTokenInfo does not include a color field
      slug: coin.id,
      is_free: coin.id === "bitcoin" || coin.id === "ethereum",
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
export const useReadCoinListDep = (summary = false) => {
  const hash = ["coin-list-dep"];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: "https://api.coin-stats.com/v4/coins?skip=0&limit=2500&sortBy=marketCap",
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
  const hash = ["get-liquid-map", timeframe, exchange, instrumentId, baseAsset, quoteAsset];
  const { data, isPending, error, isSuccess, refetch, isFetching } = useQuery<LiquidMapDataResponse>({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/liq-map?timeframe=${timeframe}&exchange=${exchange}&instrumentId=${instrumentId}&baseAsset=${baseAsset}&quoteAsset=${quoteAsset}`,
      });
      return response.data;
    },
    enabled: !!timeframe && !!exchange && !!instrumentId && !!baseAsset && !!quoteAsset,
  });
  let returnData: FormatLiquidationDataResult | undefined = undefined;
  if (data) {
    returnData = formatLiquidationData(data);
  }
  return {
    data: returnData,
    isPending,
    isSuccess,
    error,
    refetch,
    isFetching,
  };
};

export const useFetchLiquidHeatMapData = (timeframe?: string, exchange?: string, symbol?: string) => {
  const hash = ["get-liquid-heat-map", timeframe, exchange, symbol];
  const { data, isPending, error, isSuccess, isFetching, refetch } = useQuery<LiquidHeatmapResponse>({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/liq-heatmap?timeframe=${timeframe}&exchange=${exchange}&symbol=${symbol}`,
      });
      console.log("response", response);
      return response.data;
    },
    enabled: !!timeframe && !!exchange && !!symbol,
  });

  return {
    data,
    isPending,
    isSuccess,
    error,
    isFetching,
    refetch,
  };
};
export const useFetchLiquidDataMerged = (timeframe?: string, asset?: string) => {
  const hash = ["get-liquid-exchange-map", timeframe, asset];
  const { data, isPending, error, isSuccess, isFetching, refetch } = useQuery<LiquidExchangeResponse>({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/ex-liq-map?timeframe=${timeframe}&asset=${asset}`,
      });
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
    isFetching,
    refetch,
  };
};

export const useFetchBinancePriceData = (
  symbol?: string, // e.g., 'BTCUSDT'
  interval?: string, // e.g., '1h', '1d'
  limit = 100, // Number of candles (max 1000)
  country = ""
) => {
  const isUS = country === "US";
  const queryKey = ["binance-price", symbol, interval, limit, isUS];

  const baseUrl = isUS ? "https://api.binance.us" : "https://api.binance.com";

  const res = useQuery<unknown>({
    queryKey,
    queryFn: async () => {
      const response = await api.get({
        url: `${baseUrl}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      });

      return response;
    },
    enabled: !!symbol && !!interval,
  });

  const transformedData: BinanceKlineFormatted[] | undefined = (res.data as BinanceKlineRaw[])?.map(
    ([time, open, high, low, close]) => ({
      time: Math.floor(time / 1000),
      open: parseFloat(open),
      high: parseFloat(high),
      low: parseFloat(low),
      close: parseFloat(close),
      value: parseFloat(close),
    })
  );

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

  const sorted = (usdtPairs || []).sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));

  const newData = {
    mover: sorted[0],
    loser: sorted[sorted.length - 1],
  };

  return {
    ...res,
    data: newData,
  };
};

export const useFetchMarkeData = () => {
  const hash = ["get-market-data"];
  const response = useQuery<BtcDominanceResponse>({
    queryKey: hash,
    queryFn: async () => {
      const res = await api.get({
        url: "https://api.coingecko.com/api/v3/global",
      });
      console.log("response", res);
      return res?.data;
    },
  });

  return response;
};

export const useFetchBinanceTokens = (country = "") => {
  const isUS = country === "US";
  const queryKey = ["binance-tokens", isUS];

  const baseUrl = isUS ? "https://api.binance.us" : "https://api.binance.com";

  const res = useQuery<BinanceSymbolInfo[]>({
    queryKey,
    queryFn: async () => {
      const response = await api.get({
        url: `${baseUrl}/api/v3/exchangeInfo`,
      });

      return response?.symbols;
    },
    // enabled: !!country,
  });

  // const usdtPairs = res?.data?.filter(
  //   (item) => item.quoteAsset === "USDT" && item.status === "TRADING"
  // );

  const mapped: CoinDataInterface[] = [];

  res?.data?.forEach((item) => {
    if (item.quoteAsset === "USDT" && item.status === "TRADING") {
      const newItem = {
        price: 0,
        priceChange: 0,
        marketCap: 0,
        volume: 0,
        icon: `https://bin.bnbstatic.com/static/assets/logos/${item.baseAsset}.png`,
        symbol: item.baseAsset,
        name: item?.baseAsset,
        slug: "",
        is_free: true,
        color: undefined,
      };

      mapped.push(newItem);
    }
  });

  return {
    ...res,
    data: mapped || [],
  };
};

export const useFetchBinanceTokenPrice = (token: string, country = "") => {
  const isUS = country === "US";
  const queryKey = ["binance-token-price", token, isUS];

  const baseUrl = isUS ? "https://api.binance.us" : "https://api.binance.com";

  const res = useQuery<BinanceTicker>({
    queryKey,
    queryFn: async () => {
      const response = await api.get({
        url: `${baseUrl}/api/v3/ticker/24hr?symbol=${token.toUpperCase()}USDT`,
      });

      return response;
    },
  });

  return res;
};

export const useFetchCoinStatsToken = () => {
  const queryKey = ["coin-stats-tokens"];

  const res = useQuery<CoinStatsTokenInfo[]>({
    queryKey,
    queryFn: async () => {
      const response = await axios.get("/api/coinstats-coins");
      return response.data;
    },
  });

  return res;
};

export const useFetchCoinStatsSingleToken = (token = "") => {
  const queryKey = ["coin-stats-single-token", token];

  const res = useQuery<CoinStatsTokenInfo>({
    queryKey,
    queryFn: async () => {
      const response = await axios.get(`/api/coinstats-coins?token=${token}`);
      return response.data;
    },
    enabled: !!token,
  });

  return res;
};

export const useFetchFearAndGreed = (token: string, token_slug?: string) => {
  const hash = ["fetch-fear-and-greed", token];
  const response = useQuery<CfgiDataResponse[]>({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/cfgi?token=${token}&period=4&values=1&token_slug=${token_slug}`,
      });
      return response.data;
    },
    enabled: !!token && !!token_slug,
    // refetchOnMount: "always",
    // refetchOnWindowFocus: "always",
    // refetchOnReconnect: "always",
  });

  return response;
};

export const useReadFearAndGridFromDb = (token: string) => {
  const hash = ["read-fear-and-grid-from-db", token];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await fetchFearAndGreed(token);
      return response;
    },
  });
  return {
    data: data,
    isPending,
    isSuccess,
    error,
  };
};

export const useFetchCoinStatsScreener = () => {
  const queryKey = ["coin-stats-screener"];

  const res = useQuery<CoinStatsTokenInfo[]>({
    queryKey,
    queryFn: async () => {
      const response = await axios.get("/api/coinstats-coins");
      return response.data;
    },
  });

  return res;
};
