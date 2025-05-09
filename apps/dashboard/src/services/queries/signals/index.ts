import useUserData from "@/lib/hooks/use-user-data";
import { CreateSignalDTO } from "@/lib/types/signal.types";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { SmartSignalRow } from "@/screens/hooks/use-smart-signals";
import { useMutation, useQuery } from "@tanstack/react-query";
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

export const useCreateSignalMutation = () => {
  return useMutation({
    mutationFn: async (data: CreateSignalDTO) => {
      return await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_BASE + "/api/v1/smart-signal/new",
        data
      );
    },
  });
};
