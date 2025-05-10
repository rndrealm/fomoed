import useUserData from "@/lib/hooks/use-user-data";
import { CreateSignalDTO, UpdateSignalDTO } from "@/lib/types/signal.types";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { SmartSignalRow } from "@/screens/hooks/use-smart-signals";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

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
        .eq("id", signalId)
        .single();

      if (error) {
        throw new Error("Failed to fetch smart signal");
      }

      if (!data) {
        throw new Error("No smart signal found");
      }
      return data;
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
        .eq("user_id", userData?.id);

      if (error) {
        throw new Error("Failed to fetch smart signals");
      }

      if (!data) {
        throw new Error("No smart signals found");
      }
      return data;
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
