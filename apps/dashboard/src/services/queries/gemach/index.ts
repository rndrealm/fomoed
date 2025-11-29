import api from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CopyTrade,
  GemachOpenPositions,
  GemachUserBalance,
  GemachUserData,
  HyperLiquidLeaderboard,
  TimeWindow,
  TradeHistoryData,
  UserStats,
} from "./types";
import { getFromLocalStorage, saveToLocalStorage } from "@/lib/utils";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

const BASE_URL = "https://fomoed-data-ingestion-509111531565.us-central1.run.app/api/v1";
// const BASE_URL = "http://localhost:3000/api/v1";

// Environment determination for Supabase auth
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const getAuthHeaders = (auth_token?: string) => ({
  ...(auth_token ? { Authorization: `Bearer ${auth_token}` } : {}),
  "x-auth-env": IS_PRODUCTION ? "production" : "development",
  "x-db-origin": SUPABASE_URL,
});

interface ReadHyperLiquidLeaderboardProps {
  timeWindow?: TimeWindow;
  topN?: number;
  sortOrder?: "asc" | "desc";
  sortBy?: "pnl" | "accountValue" | "volume" | "roi";
  authToken?: string;
}

export const useReadHyperLiquidLeaderboard = (props: ReadHyperLiquidLeaderboardProps) => {
  const { timeWindow = "week", topN = 100, sortOrder = "desc", sortBy = "pnl", authToken } = props;

  const hash = ["hyper-liquid-leaderboard", timeWindow, topN, sortOrder, sortBy];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `${BASE_URL}/gemach/leaderboard?timeWindow=${timeWindow}&topN=${topN}&sortOrder=${sortOrder}&sortBy=${sortBy}`,
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
  });

  return {
    ...res,
    data: (res?.data?.data as HyperLiquidLeaderboard[]) || [],
  };
};

export const useReadGemachNone = (wallet: string, authToken?: string) => {
  const hash = ["gemach-nonce", wallet];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `${BASE_URL}/gemach/auth/nonce?wallet=${wallet}`,
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
    enabled: !!wallet,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    ...res,
    // data: (res?.data?.data as HyperLiquidLeaderboard[]) || [],
  };
};

// export const useGemachLogin = ()=> {
//   const res = useMutation
// }

type LoginDataProps = {
  address: string;
  nonce: number;
  publicKeyCompressedWith0x: string;
  signature: string;
  chainId: number;
};

export const useGemachLogin = (authToken?: string) => {
  return useMutation({
    mutationFn: async (data: LoginDataProps) => {
      const res = await api.gemachPost({
        url: `${BASE_URL}/gemach/auth/login`,
        body: data,
        auth: false,
        headers: getAuthHeaders(authToken),
      });

      saveToLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_USER_DATA, res?.data?.data);
      return res?.data?.data;
    },
  });
};

export const useGemachNonce = (authToken?: string) => {
  return useMutation({
    mutationFn: async (address: string) => {
      const res = await api.get({
        url: `${BASE_URL}/gemach/auth/nonce?address=${address}`,
        auth: false,
        headers: getAuthHeaders(authToken),
      });

      saveToLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_NONCE, res?.data?.data);
      return res?.data?.data;
    },
  });
};

export const useReadGemachBalance = (authToken?: string) => {
  const address = getFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_USER_DATA)?.address || "";
  const hash = ["gemach-balance", address];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `${BASE_URL}/gemach/balance?address=${address}`,
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data?.data;
    },
    enabled: !!address,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    ...res,
    data: res?.data as GemachUserBalance | null,
  };
};

export const useReadGemachUser = (wallet: string, isLoggedIn: boolean, authToken?: string) => {
  const publicKey = getFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_NONCE)?.publicKeyCompressed || "";
  const hash = ["read-gemach-user", wallet, publicKey];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `${BASE_URL}/gemach/user?address=${wallet}&publicKey=${publicKey}`,
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data?.data;
    },
    enabled: !!wallet && !!publicKey && isLoggedIn,
    retry: false,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    ...res,
    data: res?.data as GemachUserData | null,
  };
};

type DepositToHyperliquidProps = {
  address: string;
  amount: string;
  gdexAddress: string;
};

export const useGemachDepositToHyperliquid = (authToken?: string) => {
  const publicKey = getFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_NONCE)?.publicKeyCompressed || "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DepositToHyperliquidProps) => {
      const res = await api.gemachPost({
        url: `${BASE_URL}/gemach/hyperliquid/deposit`,
        body: { ...data, publicKey },
        auth: false,
        headers: getAuthHeaders(authToken),
      });

      return res?.data?.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["read-copy-trade-list"] });
      queryClient.invalidateQueries({ queryKey: ["gemach-balance"] });
      queryClient.invalidateQueries({ queryKey: ["read-gemach-user"] });
    },
  });
};

type WithdrawFromHyperliquidProps = {
  address: string;
  amount: string;
};

export const useGemachWithdrawFromHyperliquid = (authToken?: string) => {
  const publicKey = getFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_NONCE)?.publicKeyCompressed || "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WithdrawFromHyperliquidProps) => {
      const res = await api.gemachPost({
        url: `${BASE_URL}/gemach/hyperliquid/withdraw`,
        body: { ...data, publicKey },
        auth: false,
        headers: getAuthHeaders(authToken),
      });

      return res?.data?.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["read-copy-trade-list"] });
      queryClient.invalidateQueries({ queryKey: ["gemach-balance"] });
      queryClient.invalidateQueries({ queryKey: ["read-gemach-user"] });
    },
  });
};

type WithdrawFromGdexProps = {
  address: string;
  amount: string;
  to: string;
};

export const useGemachWithdrawFromGdex = (authToken?: string) => {
  const publicKey = getFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_NONCE)?.publicKeyCompressed || "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WithdrawFromGdexProps) => {
      const res = await api.gemachPost({
        url: `${BASE_URL}/gemach/token/withdraw`,
        body: { ...data, publicKey },
        auth: false,
        headers: getAuthHeaders(authToken),
      });

      return res?.data?.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["read-copy-trade-list"] });
      queryClient.invalidateQueries({ queryKey: ["gemach-balance"] });
      queryClient.invalidateQueries({ queryKey: ["read-gemach-user"] });
    },
  });
};

type CreateHyperliquidCopyTradeProps = {
  address: string;
  lossPercent: string;
  profitPercent: string;
  copyMode: string;
  fixedAmountCostPerOrder: string;
  oppositeCopy: string;
  copyTradeName: string;
  traderWallet: string;
};

export const useGemachCreateHyperliquidCopyTrade = (authToken?: string) => {
  const publicKey = getFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_NONCE)?.publicKeyCompressed || "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateHyperliquidCopyTradeProps) => {
      const res = await api.gemachPost({
        url: `${BASE_URL}/gemach/hyperliquid/copy-trade`,
        body: { ...data, publicKey },
        auth: false,
        headers: getAuthHeaders(authToken),
      });

      return res?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["read-copy-trade-list"] });
      queryClient.invalidateQueries({ queryKey: ["gemach-balance"] });
      queryClient.invalidateQueries({ queryKey: ["read-gemach-user"] });
    },
  });
};

export const useReadGemachCopyTrades = (address = "", isLoggedIn: boolean, authToken?: string) => {
  const publicKey = getFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_NONCE)?.publicKeyCompressed || "";
  const hash = ["read-copy-trade-list", address];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `${BASE_URL}/gemach/hyperliquid/copy-trade?address=${address}&publicKey=${publicKey}`,
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data?.data;
    },
    enabled: !!address && isLoggedIn,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    ...res,
    data: (res?.data as CopyTrade[]) || [],
  };
};

type UpdateHyperliquidCopyTradeProps = {
  address: string;
  lossPercent: string;
  profitPercent: string;
  copyMode: string;
  fixedAmountCostPerOrder: string;
  oppositeCopy: string;
  copyTradeName: string;
  traderWallet: string;
  copyTradeId: string;
  isChangeStatus?: boolean;
  isDelete?: boolean;
};

export const useGemachUpdateHyperliquidCopyTrade = (authToken?: string) => {
  const queryClient = useQueryClient();
  const publicKey = getFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_NONCE)?.publicKeyCompressed || "";

  return useMutation({
    mutationFn: async (data: UpdateHyperliquidCopyTradeProps) => {
      const res = await api.gemachPut({
        url: `${BASE_URL}/gemach/hyperliquid/copy-trade`,
        body: { ...data, publicKey },
        auth: false,
        headers: getAuthHeaders(authToken),
      });

      return res?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["read-copy-trade-list"] });
      queryClient.invalidateQueries({ queryKey: ["gemach-balance"] });
      queryClient.invalidateQueries({ queryKey: ["read-gemach-user"] });
    },
  });
};

export const useReadGemachTradeHistory = (
  address = "",
  authToken?: string,
  page = 1,
  limit = 100,
  filterByTrader?: string,
) => {
  const publicKey = getFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_NONCE)?.publicKeyCompressed || "";
  const hash = ["read-trade-history", address, page, limit, filterByTrader];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `${BASE_URL}/gemach/hyperliquid/trade-history?address=${address}&publicKey=${publicKey}&page=${page}&limit=${limit}${filterByTrader ? `&filterByTrader=${filterByTrader}` : ""}`,
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data?.data;
    },
    enabled: !!address && !!publicKey,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    ...res,
    data: res?.data as TradeHistoryData | null,
  };
};

export const useReadUserStats = (authToken?: string) => {
  const address = getFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_USER_DATA)?.address || "";

  const hash = ["read-user-stats", address];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `${BASE_URL}/gemach/user/stats?address=${address}`,
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data?.data;
    },
    enabled: !!address,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    ...res,
    data: res?.data?.userStats as UserStats | null,
  };
};

export const useReadGemachOpenPositions = (authToken?: string) => {
  const address = getFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_USER_DATA)?.address || "";
  const hash = ["read-open-positions", address];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `${BASE_URL}/gemach/hyperliquid/open-orders?address=${address}`,
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data?.data;
    },
    enabled: !!address,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 10 * 1000,
  });

  return {
    ...res,
    data: res?.data as GemachOpenPositions | null,
  };
};

type CloseAllPositionsProps = {
  address: string;
};

export const useGemachCloseAllPositions = (authToken?: string) => {
  const publicKey = getFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_NONCE)?.publicKeyCompressed || "";

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CloseAllPositionsProps) => {
      const res = await api.gemachPost({
        url: `${BASE_URL}/gemach/hyperliquid/copy-trade/close-all`,
        body: { ...data, publicKey },
        auth: false,
        headers: getAuthHeaders(authToken),
      });

      return res?.data?.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["read-copy-trade-list"] });
      queryClient.invalidateQueries({ queryKey: ["gemach-balance"] });
      queryClient.invalidateQueries({ queryKey: ["read-gemach-user"] });
    },
  });
};

type CloseSinglePositionProps = {
  address: string;
  coin: string; // e.g., "BTC", "ETH", "SOL"
  size: string; // Position size to close
  isLongPosition: boolean; // true if closing a long position, false if closing short
};

export const useGemachCloseSinglePosition = (authToken?: string) => {
  const publicKey = getFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_NONCE)?.publicKeyCompressed || "";

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CloseSinglePositionProps) => {
      const res = await api.gemachPost({
        url: `${BASE_URL}/gemach/hyperliquid/copy-trade/close`,
        body: { ...data, publicKey },
        auth: false,
        headers: getAuthHeaders(authToken),
      });

      return res?.data?.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["read-copy-trade-list"] });
      queryClient.invalidateQueries({ queryKey: ["gemach-balance"] });
      queryClient.invalidateQueries({ queryKey: ["read-gemach-user"] });
    },
  });
};
