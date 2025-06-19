import useUserData from "@/lib/hooks/use-user-data";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { SmartSignalRow } from "@/screens/hooks/use-smart-signals";
import api from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CreateSignalDTO, GetAiSignalResponse, UpdateSignalDTO } from "./types";

export const useSmartSignalById = (signalId: string | null) => {
  const userData = useUserData();

  const hash = ["get-smart-signal", signalId];

  return useQuery<SmartSignalRow>({
    queryKey: hash,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("smart_signals")
        .select("*")
        .eq("id", +signalId!)
        .single();

      if (error) {
        throw new Error("Failed to fetch smart signal");
      }

      if (!data) {
        throw new Error("No smart signal found");
      }
      return data as SmartSignalRow;
    },
    enabled: !!signalId,
  });
};

export const useSmartSignals = () => {
  const userData = useUserData();
  const hash = ["get-smart-signals", userData?.id];

  return useQuery<SmartSignalRow[]>({
    queryKey: hash,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("smart_signals")
        .select("*")
        .eq("user_id", userData!.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error("Failed to fetch smart signals");
      }

      if (!data) {
        throw new Error("No smart signals found");
      }
      return data as SmartSignalRow[];
    },
    enabled: !!userData,
  });
};

export const useDeleteSmartSignal = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (signalId: number) => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("smart_signals")
        .delete()
        .eq("id", signalId);

      if (error) {
        throw new Error("Failed to delete smart signal");
      }

      client.invalidateQueries({
        queryKey: ["get-smart-signals"],
      });
    },
  });
};

export const useUpdateSmartSignal = () => {
  return useMutation({
    mutationFn: async (data: UpdateSignalDTO) => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("smart_signals")
        .update(data)
        .eq("id", data.id);

      if (error) {
        throw new Error("Failed to update smart signal");
      }
    },
  });
};

export const useCreateSignalMutation = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSignalDTO) => {
      // this will be replaced with an axios instance. leave it for now
      await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_BASE + "/api/v1/smart-signal/new",
        data
      );

      client.invalidateQueries({
        queryKey: ["get-smart-signals"],
      });
    },
  });
};

export const useGetAISignal = () => {
  return useMutation({
    mutationFn: async (prompt: string) => {
      console.log("🚀 ~ mutationFn: ~ prompt:", prompt);
      const res = await api.post({
        url: "/api/signals/ai-builder",
        body: { prompt },
        auth: true,
      });
      console.log("🚀 ~ mutationFn: ~ res:", res);

      return res.data as GetAiSignalResponse;
    },
  });
};

export const useGenerateSignalDetails = () => {
  return useMutation({
    mutationFn: async (jsonLogic: Record<string, any>) => {
      const res = await api.post({
        url: "/api/signals/details-generator",
        body: { jsonLogic },
        auth: true,
      });

      return res.data;
    },
  });
};

export const useValueSuggestions = (
  dataSourceId: string | null,
  topic: string | null
) => {
  return useQuery({
    queryKey: ["value-suggestions", dataSourceId, topic],
    queryFn: async () => {
      if (!dataSourceId || !topic) {
        return { suggestions: [] };
      }

      const cleanTopic = topic.replace("ticker_", "");

      const res = await api.get({
        url: `/api/signals/value-suggestions?dataSourceId=${dataSourceId}&topic=${cleanTopic}`,
        auth: true,
      });

      console.log("🚀 ~ queryFn: ~ res:", res);

      return res as {
        suggestions: Array<{
          value: number;
          label: string;
        }>;
        error?: string;
      };
    },
    enabled: !!dataSourceId && !!topic,
    refetchOnWindowFocus: false,
  });
};
