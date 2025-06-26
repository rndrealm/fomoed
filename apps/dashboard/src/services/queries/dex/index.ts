import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import {
  BuildTransactionResult,
  ChainType,
  DexQuoteParams,
  DexQuoteResult,
  TokenBalanceResponse,
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
        url: `/api/dex/fetch-token?chainId=${chainId}&userAddress=${userAddress}`,
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
        url: `/api/dex/search-token?q=${search}`,
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
        url: `/api/dex/supported-chains`,
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

export const useTokenBalanceRead = (
  chainId?: string,
  userAddress?: string,
  tokenAddress?: string
) => {
  const hash = ["get-token-balance", userAddress, tokenAddress, chainId];
  const { data, isPending, error, isSuccess, refetch } =
    useQuery<TokenBalanceResponse>({
      queryKey: hash,
      queryFn: async () =>
        await api.get({
          url: `https://api.socket.tech/v2/balances/token-balance?tokenAddress=${tokenAddress}&chainId=${chainId}&userAddress=${userAddress}`,
        }),
      enabled: !!userAddress && !!tokenAddress && !!chainId,
    });
  return {
    data: data?.result,
    isPending,
    isSuccess,
    error,
    refetch,
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
    params.slippage,
  ];

  const url = `/api/dex/get-quote`;
  const queryParams = new URLSearchParams(params as any);
  const fullUrl = `${url}?${queryParams}`;

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

  return {
    data,
    isPending,
    isSuccess,
    error,
    isError,
    isLoading,
  };
};

export const useBuildTransaction = (quoteId: string) => {
  const hash = ["dex-build-transaction"];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `api/dex/build-tx?quoteId=${quoteId}`,
      });
      return response.result as BuildTransactionResult;
    },
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};
