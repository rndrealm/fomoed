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
  OrderBookDeltaResponse,
  SupportedPairsData,
  Ticker,
  WhaleTransactionResponse,
  EconomicCalendarResponse,
  FormatLeverageLiquidationDataResult,
  LeverageLiquidationResponse,
  FormatExcLiquidationDataResult,
} from "./types";
import { supportedExchangePairsToOptions } from "@/lib/utils";
import { ExchangePairOption } from "@/charts/types";
import { formatLiquidationData, formatMergetLiquidMapData, formatLeverageLiquidationData } from "./helpers";
import axios from "axios";
import { fetchFearAndGreed } from "./actions";

export const useReadCfgiData = (token?: string, period?: string, token_slug?: string) => {
  const hash = ["cfgi", token, period, token_slug];
  const { data: responseData, isPending, error, isSuccess, refetch, isLoading, isFetching } = useQuery<{
    data: CfgiDataResponse[];
    source: string;
  }>({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/cfgi?token=${token}&period=${period}&values=1200&token_slug=${token_slug}`,
      });
      return response; // Return full response including source
    },
    enabled: !!token && !!period && !!token_slug,
  });
  return {
    data: responseData?.data,
    source: responseData?.source,
    isPending,
    isSuccess,
    error,
    refetch,
    isLoading,
    isFetching,
  };
};

export const useReadCoinList = (summary = false) => {
  const queryKey = ["coin-list"];

  const { data, isPending, error, isSuccess } = useQuery<CoinStatsTokenInfo[]>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await axios.get("/api/coinstats-coins");
        return response.data;
      } catch (err: any) {
        const message =
          err?.response?.data?.error ||
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch coin list";

        throw new Error(message);
      }
    },
    refetchOnMount: summary ? "always" : false,
    refetchOnReconnect: summary ? "always" : false,
    refetchOnWindowFocus: summary ? "always" : false,
  });

  // Transform data
  let formatted = data
    ?.filter((coin) => !coin.symbol.startsWith("USD"))
    .map((coin) => ({
      price: coin.price,
      priceChange: coin.priceChange1d,
      marketCap: coin.marketCap,
      volume: coin.volume,
      icon: coin.icon,
      symbol: coin.symbol,
      name: coin.name,
      color: undefined,
      slug: coin.id,
      is_free: coin.id === "bitcoin" || coin.id === "ethereum",
      explorer: coin.explorers,
    }));

  if (summary) {
    formatted = formatted?.sort((a, b) => b.priceChange - a.priceChange);
  }

  return {
    data: formatted,
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
  quoteAsset?: string,
) => {
  const hash = ["get-liquid-map", timeframe, exchange, instrumentId, baseAsset, quoteAsset];

  const { data, isPending, error, isSuccess, refetch, isFetching } = useQuery<LiquidMapDataResponse>({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/liq-map?timeframe=${timeframe}&exchange=${exchange}&instrumentId=${instrumentId}&baseAsset=${baseAsset}&quoteAsset=${quoteAsset}`,
      });

      if (!response || response.error) {
        throw new Error(response?.error || "Failed to fetch liquidation map data");
      }

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

      if (!response || response.error) {
        throw new Error(response?.error || "Failed to fetch liquidation heatmap data");
      }

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

  const {
    data,
    isPending,
    error,
    isSuccess,
    isFetching,
    refetch,
  } = useQuery<LiquidExchangeResponse>({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/ex-liq-map?timeframe=${timeframe}&asset=${asset}`,
      });

      if (!response || response.error) {
        throw new Error(response?.error || "Failed to fetch liquid exchange map data");
      }

      return response.data;
    },
    enabled: !!timeframe && !!asset,
  });

  let resData: FormatExcLiquidationDataResult | null = null;

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

export const useFetchBinancePriceData = (symbol?: string, interval?: string, limit = 1000, country = "") => {
  const isUS = country === "US";
  const queryKey = ["binance-price", symbol, interval, limit];

  const res = useQuery<BinanceKlineRaw[]>({
    queryKey,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/binance?source=binance&endpoint=/api/v3/klines&symbol=${symbol}&interval=${interval}&limit=${limit}`,
      });
      return response;
    },
    enabled: !!symbol && !!interval,
  });

  const transformedData: BinanceKlineFormatted[] | undefined = res.data?.map(([time, open, high, low, close]) => ({
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

export const useFetchTopGainerLoser = (country = "") => {
  const isUS = country === "US";
  const queryKey = ["binance-top-gainer-loser"];

  const res = useQuery<Ticker[]>({
    queryKey,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/binance?source=binance&endpoint=/api/v3/ticker/24hr`,
      });
      return response;
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
  });

  const usdtPairs =
    res.data?.filter((item) => item.symbol.endsWith("USDT")).filter((item) => parseFloat(item.quoteVolume) > 1000000) ||
    [];

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
  const queryKey = ["get-market-data"];

  const response = useQuery<BtcDominanceResponse>({
    queryKey,
    queryFn: async () => {
      const res = await api.get({
        url: "https://api.coingecko.com/api/v3/global",
      });

      if (!res || !res.data) {
        const message =
          typeof res?.error === "string"
            ? res.error
            : res?.error?.message || res?.error?.msg || "Failed to fetch market data";

        throw new Error(message);
      }

      return res.data;
    },
  });

  return response;
};

export const useFetchBinanceTokens = (country = "") => {
  const isUS = country === "US";
  const queryKey = ["binance-tokens"];

  const res = useQuery<BinanceSymbolInfo[]>({
    queryKey,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/binance?source=binance&endpoint=/api/v3/exchangeInfo`,
      });
      return response?.symbols;
    },
  });

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

export const useFetchBinanceTokenPrice = (token?: string, country = "") => {
  const isUS = country === "US";
  const queryKey = ["binance-token-price", token];

  const res = useQuery<BinanceTicker>({
    queryKey,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/binance?source=binance&endpoint=/api/v3/ticker/24hr&symbol=${token?.toUpperCase()}USDT`,
      });
      return response;
    },
    enabled: !!token,
  });

  return res;
};

export const useFetchCoinStatsToken = () => {
  const queryKey = ["coin-stats-tokens"];

  const res = useQuery<CoinStatsTokenInfo[]>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await axios.get("/api/coinstats-coins");
        return response.data;
      } catch (err: any) {
        const message =
          err?.response?.data?.error ||
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch token list";

        throw new Error(message);
      }
    },
  });

  return res;
};

export const useFetchCoinStatsSingleToken = (token = "") => {
  const queryKey = ["coin-stats-single-token", token];

  const res = useQuery<CoinStatsTokenInfo>({
    queryKey,
    enabled: !!token,
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/coinstats-coins?token=${token}`);
        return response.data;
      } catch (err: any) {
        const message =
          err?.response?.data?.error ||
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch token info";

        throw new Error(message);
      }
    },
  });

  return res;
};

// COMMENTED OUT: Old CFGI.io hook (too expensive, replaced with Alternative.me)
// Kept for reference in case we need to switch back
// export const useFetchFearAndGreed = (token: string, token_slug?: string) => {
//   const hash = ["fetch-fear-and-greed", token];
//
//   const { data, isPending, error, isSuccess, isFetching, refetch } = useQuery<CfgiDataResponse[]>({
//     queryKey: hash,
//     queryFn: async () => {
//       const response = await api.get({
//         url: `/api/cfgi?token=${token}&period=4&values=1&token_slug=${token_slug}`,
//       });
//
//       const message =
//         response?.error || response?.message || response?.data?.error || "Failed to fetch fear & greed data";
//
//       if (!response || response.error) {
//         throw new Error(message);
//       }
//
//       return response.data;
//     },
//     enabled: !!token && !!token_slug,
//   });
//
//   // Normalize error to ensure it always has a message property
//   const normalizedError = error
//     ? new Error(
//         (error as any)?.message ||
//           (error as any)?.msg ||
//           (error as any)?.error ||
//           JSON.stringify(error) ||
//           "Failed to fetch fear & greed data"
//       )
//     : null;
//
//   return {
//     data,
//     isPending,
//     error: normalizedError,
//     isSuccess,
//     isFetching,
//     refetch,
//   };
// };

// NEW: Alternative.me Fear & Greed Index API (Free, Bitcoin-focused)
// Replaces CFGI.io to reduce costs
export const useFetchAlternativeMeFearAndGreed = () => {
  const hash = ["fetch-alternative-me-fear-and-greed"];

  const { data, isPending, error, isSuccess, isFetching, refetch } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      try {
        const response = await axios.get('https://api.alternative.me/fng/?limit=2');

        // Alternative.me response format: { data: [{ value: "45", value_classification: "Fear", timestamp: "1638360000" }] }
        // Map ALL items to CFGI format for compatibility
        return response.data.data.map((item: any) => ({
          cfgi: parseInt(item.value),
          date: new Date(parseInt(item.timestamp) * 1000).toISOString(),
          value_classification: item.value_classification,
        }));
      } catch (err: any) {
        const message =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch fear & greed data from Alternative.me";

        throw new Error(message);
      }
    },
  });

  return {
    data,
    isPending,
    error,
    isSuccess,
    isFetching,
    refetch,
  };
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

export const useFetchOrderbookDelta = (exchange: string, symbol: string, interval: string, range: string) => {
  const queryKey = ["get-orderbook-delta", exchange, symbol, interval, range];

  const { data, isPending, error, isSuccess, isFetching, refetch } = useQuery<OrderBookDeltaResponse>({
    queryKey,
    queryFn: async () => {
      const url = `/api/delta?exchange=${exchange}&symbol=${symbol}&interval=${interval}&range=${range}`;

      let response: Response;

      try {
        response = await fetch(url);
      } catch (networkError: any) {
        throw new Error(networkError?.message || "Network error fetching orderbook delta");
      }

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const message = json?.error || json?.message || "Failed to fetch orderbook delta data";

        throw new Error(message);
      }

      return json;
    },
    enabled: !!exchange && !!symbol && !!interval && !!range,
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

export const useFetchWhaleTransactions = () => {
  const queryKey = ["get-whale-transactions"];

  const { data, isPending, error, isSuccess, isFetching, refetch } = useQuery<WhaleTransactionResponse>({
    queryKey,
    queryFn: async () => {
      const response = await api.get({ url: `/api/whale-transaction` });

      if (!response?.data) {
        throw new Error(response?.error || "Failed to fetch whale transaction data");
      }

      return response;
    },
    refetchInterval: 5000,
  });

  return {
    data: data?.data, 
    isPending,
    isSuccess,
    error,
    isFetching,
    refetch,
  };
};

export const useFetchEconomicCalendar = () => {
  const queryKey = ["get-economic-calendar"];

  const { data, isPending, error, isSuccess, isFetching, refetch } = useQuery<EconomicCalendarResponse>({
    queryKey: queryKey,
    queryFn: async () => {
      const url = `/api/economic-calendar`;

      const response = await api.get({ url });

      if (!response.data) {
        const errorMessage =
          typeof response.error === "string"
            ? response.error
            : response.error?.message || "Failed to fetch economic calendar data";

        throw new Error(errorMessage);
      }

      return response;
    },
    refetchInterval: 300000,
  });

  const normalizedError = error
    ? new Error((error as any)?.message || (error as any)?.msg || (error as any)?.error || JSON.stringify(error))
    : null;

  return {
    data: data?.data,
    isPending,
    isSuccess,
    error: normalizedError,
    isFetching,
    refetch,
  };
};
