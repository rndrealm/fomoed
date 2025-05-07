import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SaveLayoutPayload } from "./types";
import { getUserTabsAction, saveLayoutAction } from "./actions";
import { toast } from "sonner";

export const useSyncLayouts = () => {
  const queryClient = useQueryClient();
  const response = useMutation({
    mutationFn: async (body: SaveLayoutPayload): Promise<any> => {
      return await saveLayoutAction(body);
    },
    onSuccess: async (data) => {
      console.log("data:", data);
      toast("Layout saved successfully.", {});
      queryClient.invalidateQueries({
        queryKey: ["layouts"],
      });
    },
    onError: (error: any) => {
      console.log("error:", error.message);
    },
  });
  return {
    ...response,
  };
};

export const useReadTabs = () => {
  const hash = ["tabs"];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await getUserTabsAction();
      return response.tabs;
    },
    staleTime: Infinity,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};
