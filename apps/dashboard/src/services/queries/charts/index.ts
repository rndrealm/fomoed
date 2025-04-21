import { useQuery } from "@tanstack/react-query";

import api from "../../api";
import {
  CfgiDataResponse,
  CoinListResponse,
  FormatLiquidationDataResult,
  LiquidMapDataResponse,
  SupportedPairsData,
} from "./types";
import { supportedExchangePairsToOptions } from "@/lib/utils";
import { ExchangePairOption } from "@/charts/types";
import { formatLiquidationData } from "./helpers";

export const useReadCfgiData = (
  token: string,
  period: string,
  token_slug: string
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

export const useReadCoinList = () => {
  const hash = ["coinList"];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: "https://api.coin-stats.com/v4/coins?skip=0&limit=2500",
      });
      return response as unknown as CoinListResponse;
    },
  });
  const returnData = data?.coins.map((coin) => {
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
  timeframe: string,
  exchange: string,
  instrumentId: string,
  baseAsset: string,
  quoteAsset: string
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
