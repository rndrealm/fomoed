import { useMutation, useQuery } from "@tanstack/react-query";
import { TradeExecutionPayload, UpdateLeveragePayload } from "./types";
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

export const useExecuteTrade = (authToken?: string) => {
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
      toast.success("Order placed successfully");
    },
    onError: (data) => {
      console.log("execute error: ", data);
      toast.error("Order execution error");
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
