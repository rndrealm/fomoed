import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import {
  ChainType,
  DexQuoteParams,
  DexQuoteResult,
  TokenListResponse,
} from "./types";

const BUNGEE_API_BASE_URL = "https://public-backend.bungee.exchange";

export const useFetchTokenList = (
  chainId: string = "1",
  userAddress?: string
) => {
  const hash = ["dex-tokens", chainId, userAddress];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `${BUNGEE_API_BASE_URL}/api/v1/tokens/list?chainIds=${chainId}&userAddress=${userAddress}`,
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
        url: `${BUNGEE_API_BASE_URL}/api/v1/tokens/search?q=${search}`,
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
        url: `${BUNGEE_API_BASE_URL}/api/v1/supported-chains`,
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

export const useGetQuote = (params: DexQuoteParams) => {
  const hash = [
    "dex-quote",
    params.userAddress,
    params.originChainId,
    params.destinationChainId,
    params.inputToken,
    params.outputToken,
    params.inputAmount,
  ];

  const url = `${BUNGEE_API_BASE_URL}/api/v1/bungee/quote`;
  const queryParams = new URLSearchParams(params as any);
  const fullUrl = `${url}?${queryParams}&enableManual=true`;

  const { data, isPending, error, isSuccess, isError, isLoading } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: fullUrl,
      });
      return response.result as DexQuoteResult;
    },
    enabled:
      !!params.userAddress &&
      !!params.originChainId &&
      !!params.destinationChainId &&
      !!params.inputToken &&
      !!params.outputToken &&
      !!params.inputAmount &&
      params.inputAmount !== "0",
  });

  console.log("quote reasssd:", data);
  return {
    data,
    isPending,
    isSuccess,
    error,
    isError,
    isLoading,
  };
};
