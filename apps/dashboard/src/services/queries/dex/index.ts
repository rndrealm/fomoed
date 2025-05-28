import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { ChainType, TokenListResponse } from "./types";

export const useFetchTokenList = (
  chainId: string = "1",
  userAddress?: string
) => {
  const hash = ["dex-tokens", chainId, userAddress];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `https://public-backend.bungee.exchange/api/v1/tokens/list?chainIds=${chainId}&userAddress=${userAddress}`,
      });
      return response.result as TokenListResponse;
    },
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};

export const useSearchTokenList = (search: string = "") => {
  const hash = ["search-dex-tokens", search];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `https://public-backend.bungee.exchange/api/v1/tokens/search?q=${search}`,
      });
      return response.result.tokens as TokenListResponse;
    },
    enabled: !!search && search.length > 1,
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};
export const useFetchSupportedChains = () => {
  const hash = ["supported-chains"];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `https://public-backend.bungee.exchange/api/v1/supported-chains`,
      });
      return response.result as ChainType[];
    },
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};
