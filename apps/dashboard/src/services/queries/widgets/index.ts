import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SaveLayoutPayload } from "./types";
import {
  getLayoutsAction,
  getUserTabsAction,
  syncLayoutAction,
} from "./actions";
import { toast } from "sonner";

export const useSyncLayouts = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (body: SaveLayoutPayload): Promise<any> => {
      return await syncLayoutAction(body);
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
    mutate,
    isPending,
    isError,
  };
};

export const useReadLayouts = () => {
  const hash = ["layouts"];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await getLayoutsAction();
      return response.layouts;
    },
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
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
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};
