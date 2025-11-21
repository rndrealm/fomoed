import api from "../../api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HyperliquidClearinghouseState,
  HyperliquidPortfolio,
  HyperliquidSpotState,
  HyperliquidOpenOrder,
  HyperliquidFill,
  HyperliquidHistoricalOrder,
  HyperliquidUserFees,
  HyperliquidUserRole,
  HyperliquidSubAccount,
  HyperliquidAllMids,
  HyperliquidMeta,
  HyperliquidSpotMeta,
  HyperliquidTwapSliceFill,
} from "./types";

const HYPERLIQUID_API_URL = "https://api.hyperliquid.xyz/info";

// Environment determination for Supabase auth
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const getAuthHeaders = (auth_token?: string) => ({
  ...(auth_token ? { Authorization: `Bearer ${auth_token}` } : {}),
  "x-auth-env": IS_PRODUCTION ? "production" : "development",
  "x-db-origin": SUPABASE_URL,
});

// ==================== ACCOUNT & BALANCE ====================

/**
 * Get user's clearinghouse state (account balance, positions, margin, etc.)
 */
export const useHyperliquidClearinghouseState = (
  userAddress: string,
  authToken?: string,
  enabled: boolean = true
) => {
  const hash = ["hyperliquid-clearinghouse-state", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "clearinghouseState",
          user: userAddress,
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    refetchInterval: 5000, // Refetch every 5 seconds for live updates
  });

  return {
    ...res,
    data: res?.data as HyperliquidClearinghouseState,
  };
};

/**
 * Get user's spot state (spot balances)
 */
export const useHyperliquidSpotState = (
  userAddress: string,
  authToken?: string,
  enabled: boolean = true
) => {
  const hash = ["hyperliquid-spot-state", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "spotClearinghouseState",
          user: userAddress,
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    refetchInterval: 5000,
  });

  return {
    ...res,
    data: res?.data as HyperliquidSpotState,
  };
};

/**
 * Get user's portfolio (account value history, PnL history)
 */
export const useHyperliquidPortfolio = (
  userAddress: string,
  authToken?: string,
  enabled: boolean = true
) => {
  const hash = ["hyperliquid-portfolio", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "portfolio",
          user: userAddress,
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: 60000, // 1 minute
  });

  return {
    ...res,
    data: res?.data as HyperliquidPortfolio,
  };
};

// ==================== MARKET DATA ====================

/**
 * Get all market mid prices
 */
export const useHyperliquidAllMids = (authToken?: string, enabled: boolean = true) => {
  const hash = ["hyperliquid-all-mids"];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "allMids",
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
    enabled,
    refetchInterval: 3000, // Refetch every 3 seconds for price updates
  });

  return {
    ...res,
    data: res?.data as HyperliquidAllMids,
  };
};

/**
 * Get exchange metadata (perpetuals)
 */
export const useHyperliquidMeta = (authToken?: string) => {
  const hash = ["hyperliquid-meta"];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "meta",
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
    staleTime: Infinity, // Meta rarely changes
  });

  return {
    ...res,
    data: res?.data as HyperliquidMeta,
  };
};

/**
 * Get spot metadata
 */
export const useHyperliquidSpotMeta = (authToken?: string) => {
  const hash = ["hyperliquid-spot-meta"];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "spotMeta",
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
    staleTime: Infinity,
  });

  return {
    ...res,
    data: res?.data as HyperliquidSpotMeta,
  };
};

// ==================== ORDERS ====================

/**
 * Get user's open orders with frontend info
 */
export const useHyperliquidOpenOrders = (
  userAddress: string,
  authToken?: string,
  enabled: boolean = true
) => {
  const hash = ["hyperliquid-open-orders", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "frontendOpenOrders",
          user: userAddress,
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    refetchInterval: 3000,
  });

  return {
    ...res,
    data: res?.data as HyperliquidOpenOrder[],
  };
};

/**
 * Get user's historical orders
 */
export const useHyperliquidHistoricalOrders = (
  userAddress: string,
  authToken?: string,
  enabled: boolean = true
) => {
  const hash = ["hyperliquid-historical-orders", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "historicalOrders",
          user: userAddress,
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: 30000, // 30 seconds
  });

  return {
    ...res,
    data: res?.data as HyperliquidHistoricalOrder[],
  };
};

/**
 * Query order status by oid or cloid
 */
export const useHyperliquidOrderStatus = (authToken?: string) => {
  return useMutation({
    mutationFn: async (props: { userAddress: string; oid: number | string }) => {
      const { userAddress, oid } = props;
      const res = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "orderStatus",
          user: userAddress,
          oid,
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return res?.data;
    },
  });
};

// ==================== FILLS & TRADES ====================

/**
 * Get user's recent fills (max 2000)
 */
export const useHyperliquidUserFills = (
  userAddress: string,
  authToken?: string,
  enabled: boolean = true
) => {
  const hash = ["hyperliquid-user-fills", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "userFills",
          user: userAddress,
          aggregateByTime: false,
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: 10000, // 10 seconds
  });

  return {
    ...res,
    data: res?.data as HyperliquidFill[],
  };
};

/**
 * Get user's fills by time range (mutation for flexibility)
 */
export const useHyperliquidUserFillsByTime = (authToken?: string) => {
  return useMutation({
    mutationFn: async (props: {
      userAddress: string;
      startTime: number;
      endTime?: number;
      aggregateByTime?: boolean;
    }) => {
      const { userAddress, startTime, endTime, aggregateByTime = false } = props;
      const res = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "userFillsByTime",
          user: userAddress,
          startTime,
          ...(endTime && { endTime }),
          aggregateByTime,
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return res?.data as HyperliquidFill[];
    },
  });
};

/**
 * Get user's TWAP slice fills
 */
export const useHyperliquidTwapSliceFills = (
  userAddress: string,
  authToken?: string,
  enabled: boolean = true
) => {
  const hash = ["hyperliquid-twap-slice-fills", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "userTwapSliceFills",
          user: userAddress,
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: 30000,
  });

  return {
    ...res,
    data: res?.data as HyperliquidTwapSliceFill[],
  };
};

// ==================== USER INFO & SETTINGS ====================

/**
 * Get user's fee schedule and rates
 */
export const useHyperliquidUserFees = (
  userAddress: string,
  authToken?: string,
  enabled: boolean = true
) => {
  const hash = ["hyperliquid-user-fees", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "userFees",
          user: userAddress,
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: 300000, // 5 minutes
  });

  return {
    ...res,
    data: res?.data as HyperliquidUserFees,
  };
};

/**
 * Get user's role (user, agent, vault, subAccount)
 */
export const useHyperliquidUserRole = (
  userAddress: string,
  authToken?: string,
  enabled: boolean = true
) => {
  const hash = ["hyperliquid-user-role", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "userRole",
          user: userAddress,
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: Infinity, // Role rarely changes
  });

  return {
    ...res,
    data: res?.data as HyperliquidUserRole,
  };
};

/**
 * Get user's subaccounts
 */
export const useHyperliquidSubAccounts = (
  userAddress: string,
  authToken?: string,
  enabled: boolean = true
) => {
  const hash = ["hyperliquid-subaccounts", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "subAccounts",
          user: userAddress,
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: 60000, // 1 minute
  });

  return {
    ...res,
    data: res?.data as HyperliquidSubAccount[],
  };
};

/**
 * Get user's rate limit status
 */
export const useHyperliquidUserRateLimit = (
  userAddress: string,
  authToken?: string,
  enabled: boolean = true
) => {
  const hash = ["hyperliquid-user-rate-limit", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "userRateLimit",
          user: userAddress,
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: 30000,
  });

  return {
    ...res,
    data: res?.data as {
      cumVlm: string;
      nRequestsUsed: number;
      nRequestsCap: number;
      nRequestsSurplus: number;
    },
  };
};

// ==================== CANDLES ====================

/**
 * Get candle snapshot for a coin
 */
export const useHyperliquidCandleSnapshot = (authToken?: string) => {
  return useMutation({
    mutationFn: async (props: {
      coin: string;
      interval: "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";
      startTime: number;
      endTime: number;
    }) => {
      const { coin, interval, startTime, endTime } = props;
      const res = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "candleSnapshot",
          req: {
            coin,
            interval,
            startTime,
            endTime,
          },
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return res?.data;
    },
  });
};

/**
 * Get L2 order book snapshot
 */
export const useHyperliquidL2Book = (authToken?: string) => {
  return useMutation({
    mutationFn: async (props: { coin: string; nSigFigs?: number; mantissa?: number }) => {
      const { coin, nSigFigs, mantissa } = props;
      const res = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "l2Book",
          coin,
          ...(nSigFigs && { nSigFigs }),
          ...(mantissa && { mantissa }),
        },
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return res?.data;
    },
  });
};