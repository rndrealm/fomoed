import useUserData from "@/lib/hooks/use-user-data";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { SmartSignalRow } from "@/screens/hooks/use-smart-signals";
import api from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CreateSignalDTO, GetAiSignalResponseBody, UpdateSignalDTO } from "./types";

export const useSmartSignalById = (signalId: string | null) => {
  const userData = useUserData();

  const hash = ["get-smart-signal", signalId];

  return useQuery<SmartSignalRow>({
    queryKey: hash,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.from("smart_signals").select("*").eq("id", +signalId!).single();

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
      const { error } = await supabase.from("smart_signals").delete().eq("id", signalId);

      if (error) {
        throw new Error("Failed to delete smart signal");
      }

      client.invalidateQueries({
        queryKey: ["get-smart-signals"],
      });
    },
  });
};

/**
 * Return either <Copy of {originalName}> based on the original name or
 * copy of <Copy #2 of {originalName}> and so on.
 * @param originalName
 */
function getCopyName(originalName: string) {
  // Check if the name already starts with "Copy"
  const copyRegex = /^Copy(?: #(\d+))? of (.+)$/;
  const match = originalName.match(copyRegex);

  if (match) {
    // If it's already a copy, increment the number
    const copyNumber = match[1] ? parseInt(match[1]) + 1 : 2;
    const baseName = match[2];
    return `Copy #${copyNumber} of ${baseName}`;
  } else {
    // If it's not a copy, make it the first copy
    return `Copy of ${originalName}`;
  }
}

/**
 * Processes a JSON string to replace topic arrays with their first element.
 * This function recursively traverses the JSON object and converts any "topic"
 * field that is an array to use only the first element of that array.
 * @param jsonString - The JSON string to process
 * @returns The processed JSON string with topic arrays replaced by their first elements
 */
function processTopicArrays(jsonString: string): string {
  try {
    const data = JSON.parse(jsonString);

    const processObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(processObject);
      } else if (obj && typeof obj === "object") {
        const processed: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (key === "topic" && Array.isArray(value) && value.length > 0) {
            processed[key] = value[0];
          } else {
            processed[key] = processObject(value);
          }
        }
        return processed;
      }
      return obj;
    };

    const processedData = processObject(data);

    // Handle condition field which might contain stringified JSON
    if (processedData.condition && typeof processedData.condition === "string") {
      try {
        const conditionJson = JSON.parse(processedData.condition);
        const processedConditionJson = processObject(conditionJson);
        processedData.condition = JSON.stringify(processedConditionJson);
      } catch {
        // If condition is not valid JSON, leave it as is
      }
    }

    return JSON.stringify(processedData);
  } catch (error) {
    console.error("Error processing topic arrays:", error);
    return jsonString;
  }
}

export const useDuplicateSmartSignal = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (signalId: number) => {
      const supabase = createSupabaseBrowserClient();

      // First, fetch the original signal
      const { data: originalSignal, error: fetchError } = await supabase
        .from("smart_signals")
        .select("*")
        .eq("id", signalId)
        .single();

      if (fetchError) {
        throw new Error("Failed to fetch original smart signal");
      }

      if (!originalSignal) {
        throw new Error("Original smart signal not found");
      }

      const originalName = originalSignal.name;

      if (!originalName) {
        throw new Error("Original smart signal name is missing");
      }

      const newName = getCopyName(originalName);
      const originalActions: any[] = originalSignal.actions || [];

      const originalCondition = originalSignal.condition;
      const hotfixedCondition = processTopicArrays(originalCondition);

      const data: CreateSignalDTO = {
        name: newName,
        description: originalSignal.description || "",
        condition: hotfixedCondition,
        user_id: originalSignal.user_id,
        actions: originalActions,
      };

      // Use the same backend endpoint as signal creation
      await axios.post("/api/signals/new", data);

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
      const { error } = await supabase.from("smart_signals").update(data).eq("id", data.id);

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
      await axios.post("/api/signals/new", data);

      client.invalidateQueries({
        queryKey: ["get-smart-signals"],
      });
    },
  });
};

export async function fetchGenerateSignal(prompt: string): Promise<GetAiSignalResponseBody> {
  const res = await api.post({
    url: "/api/signals/ai-builder",
    body: { prompt },
    auth: true,
  });

  return res as unknown as GetAiSignalResponseBody;
}

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

export const useValueSuggestions = (dataSourceId: string | null, topic: string | null) => {
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
