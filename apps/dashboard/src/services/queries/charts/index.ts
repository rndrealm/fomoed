import { useQuery } from "@tanstack/react-query";

import api from "../../api";
import { CfgiDataResponse, CoinListResponse } from "./types";

export const useReadCfgiData = (token: string, period: string) => {
  const hash = ["cfgi", token, period];
  const { data, isPending, error, isSuccess } = useQuery<CfgiDataResponse[]>({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/cfgi?token=${token}&period=${period}&values=1200`,
      });
      return response.data;
    },
    enabled: !!token && !!period,
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
