import api from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AscendexMarketData, AscendexMarketTicker } from "./types";

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

export const useReadAscendexMarkets = (authToken?: string) => {
  const hash = ["ascendex-markets"];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `${BASE_URL}/ascendex/markets`,
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
  });

  return {
    ...res,
    data: res?.data?.data as AscendexMarketData,
  };
};

type ReadAscendexKlinesProps = {
  symbol: string;
  timeframe: string;
  since?: string;
  limit?: string;
};

export const useReadAscendexKlines = (authToken?: string) => {
  return useMutation({
    mutationFn: async (props: ReadAscendexKlinesProps) => {
      const { symbol, timeframe, since, limit } = props;
      const res = await api.get({
        url: `${BASE_URL}/ascendex/klines?symbol=${symbol}&timeframe=${timeframe}&since=${since}&limit=${limit}`,
        auth: false,
        headers: getAuthHeaders(authToken),
      });

      return res?.data?.data;
    },
  });
};

export const useReadAscendexTicker = (symbol: string, authToken?: string) => {
  const hash = ["ascendex-ticker", symbol];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `${BASE_URL}/ascendex/ticker?symbol=${symbol}`,
        auth: false,
        headers: getAuthHeaders(authToken),
      });
      return response?.data;
    },
  });

  return {
    ...res,
    data: res?.data?.data as AscendexMarketTicker,
  };
};
