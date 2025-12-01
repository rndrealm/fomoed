import { useMutation, useQuery } from "@tanstack/react-query";
import { TradeExecutionPayload, UpdateLeveragePayload } from "./types";
import { updateExchangeAction, UpdateExchangePayload } from "./actions";
import api from "@/services/api";
import { toast } from "sonner";

// const BASE_URL = "https://fomoed-data-ingestion-509111531565.us-central1.run.app/api/v1";
const BASE_URL = "http://localhost:3000/api/v1";

// Environment determination for Supabase auth
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const getAuthHeaders = (auth_token?: string) => ({
  ...(auth_token ? { Authorization: `Bearer ${auth_token}` } : {}),
  "x-auth-env": IS_PRODUCTION ? "production" : "development",
  "x-db-origin": SUPABASE_URL,
});

export const useExecuteTrade = (authToken?: string, onSuccess?: () => void) => {
  return useMutation({
    mutationFn: async (data: TradeExecutionPayload) => {
      const res = await api.gemachPost({
        url: `${BASE_URL}/trading/execute`,
        body: data,
        auth: false,
        headers: getAuthHeaders(authToken),
      });

      return res?.data?.data;
    },
    onSuccess: (data) => {
      console.log("execute success: ", data);
      onSuccess?.();
      toast.success("Order placed successfully");
    },
    onError: (data: any) => {
      console.log("execute error: ", data.response.data.error.message);
      toast.error(data?.response?.data?.error?.message || "Order execution error");
    },
  });
};

export const useUpdateLeveraggeTrade = (onSuccessCallback: () => void, authToken?: string) => {
  return useMutation({
    mutationFn: async (data: UpdateLeveragePayload) => {
      const res = await api.gemachPost({
        url: `${BASE_URL}/trading/update-leverage`,
        body: data,
        auth: false,
        headers: getAuthHeaders(authToken),
      });

      return res?.data?.data;
    },
    onSuccess: (data) => {
      console.log("execute success: ", data);
      onSuccessCallback();
      toast.success("Leverage updated successfully");
    },
    onError: (data) => {
      console.log("execute error: ", data);
      toast.error("Leverage update error");
    },
  });
};

export const useUpdateExchange = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: async (data: UpdateExchangePayload) => {
      return await updateExchangeAction(data);
    },
    onSuccess: (data) => {
      console.log("exchange update success: ", data);
      onSuccess?.();
      // toast.success("Exchange updated to hyperliquid");
    },
    onError: (error: any) => {
      console.log("exchange update error: ", error);
      toast.error(error?.message || "Exchange update error");
    },
  });
};
