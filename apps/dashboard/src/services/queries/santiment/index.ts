import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { WeightedSentiment, WeightedSentimentToken } from "./types";

const BASE_URL = `${process.env.NEXT_PUBLIC_FOMOED_INGESTION_URL}/api/v1`;

// Environment determination for Supabase auth
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

/**
 * Helper function to get headers with authentication and environment information
 * @param auth_token The authentication token
 * @returns Headers object with Authorization and x-auth-env headers
 */
const getAuthHeaders = (auth_token?: string) => ({
  ...(auth_token ? { Authorization: `Bearer ${auth_token}` } : {}),
  "x-auth-env": IS_PRODUCTION ? "production" : "development",
  "x-db-origin": SUPABASE_URL,
});

// INTERVAL OPTIONS
// ["5m", "1h", "8h", "1d"]

interface ReadWeightedSentimentProps {
  auth_token?: string;
  token?: string;
  interval?: string;
}

export const useReadWeightedSentiment = (props: ReadWeightedSentimentProps) => {
  const { auth_token, token = "bitcoin", interval = "1h" } = props;

  const hash = ["weighted-sentiment", token, interval];

  const { data, error, isPending, isFetching, isSuccess, refetch } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `${BASE_URL}/santiment/weighted-sentiment?slug=${token}&interval=${interval}`,
        auth: false,
        headers: getAuthHeaders(auth_token),
      });

      if (!response || response.error) {
        throw new Error(response?.error || "Failed to fetch weighted sentiment");
      }

      return response.data;
    },
    enabled: !!auth_token,
  });

  return {
    data: data?.data as WeightedSentiment[],
    error,
    isPending,
    isFetching,
    isSuccess,
    refetch,
  };
};

export const useReadSantimentTokenPrice = (props: ReadWeightedSentimentProps) => {
  const { auth_token, interval = "1h", token = "bitcoin" } = props;
  const hash = ["santiment-token-price", token, interval];
  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `${BASE_URL}/santiment/price-usd?slug=${token}&interval=${interval}`,
        auth: false,
        headers: getAuthHeaders(auth_token),
      });
      return response?.data as any;
    },
    enabled: !!auth_token,
  });

  return {
    ...res,
    data: res?.data?.data as WeightedSentiment[],
  };
};

interface ReadSantimentTokenListProps {
  auth_token?: string;
}

export const useReadSantimentTokenList = (props: ReadSantimentTokenListProps) => {
  const { auth_token } = props;
  const queryKey = ["santiment-token-list"];

  const res = useQuery({
    queryKey,
    enabled: !!auth_token,
    queryFn: async () => {
      try {
        const response = await api.get({
          url: `${BASE_URL}/santiment/token-list`,
          auth: false,
          headers: getAuthHeaders(auth_token),
        });

        return response?.data;
      } catch (err: any) {
        const message =
          err?.response?.data?.error ||
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch Santiment token list";

        throw new Error(message);
      }
    },
  });

  return {
    ...res,
    data: (res?.data?.data ?? []) as WeightedSentimentToken[],
  };
};

interface ReadSantimentVolumeProps {
  auth_token?: string;
  token?: string;
  interval?: "5m" | "1h" | "8h" | "1d";
  from?: string;
  to?: string;
}

export const useReadSantimentVolume = (props: ReadSantimentVolumeProps) => {
  const { auth_token, token = "bitcoin", interval = "1d", from = "utc_now-1d", to = "utc_now" } = props;

  const hash = ["santiment-volume", token, interval, from, to];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `${BASE_URL}/santiment/volume-usd?slug=${token}&interval=${interval}&from=${from}&to=${to}`,
        auth: false,
        headers: getAuthHeaders(auth_token),
      });
      return response?.data as any;
    },
    enabled: !!auth_token,
    refetchInterval: 5 * 60 * 1000,
  });

  return {
    ...res,
    data: res?.data?.data as { datetime: string; value: number }[],
  };
};

interface ReadSantimentMarketCapProps {
  auth_token?: string;
  token?: string;
  interval?: "5m" | "1h" | "8h" | "1d";
}

export const useReadSantimentMarketCap = (props: ReadSantimentMarketCapProps) => {
  const { auth_token, token = "bitcoin", interval = "1d" } = props;

  const hash = ["santiment-marketcap", token, interval];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `${BASE_URL}/santiment/marketcap-usd?slug=${token}&interval=${interval}`,
        auth: false,
        headers: getAuthHeaders(auth_token),
      });
      return response?.data as any;
    },
    enabled: !!auth_token,
    refetchInterval: 5 * 60 * 1000,
  });

  return {
    ...res,
    data: (res?.data?.data?.length as { datetime: string; value: number })
      ? res.data.data[res.data.data.length - 1].value
      : undefined,
  };
};
