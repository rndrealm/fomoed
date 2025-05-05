import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTabAction,
  deleteTabAction,
  getUserTabsAction,
  replaceUserTabsAction,
} from "./actions";
import { toast } from "sonner";
import { AddTabPayload, SyncTabsPayload } from "./types";

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

export const useAddTabs = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (body: AddTabPayload): Promise<any> => {
      return await addTabAction(body);
    },
    onMutate: async (newTab) => {
      await queryClient.cancelQueries({ queryKey: ["tabs"] });

      const previousTabs = queryClient.getQueryData(["tabs"]);

      queryClient.setQueryData(["tabs"], (old: any) => [...old, newTab]);

      return { previousTabs };
    },
    onSuccess: async (data) => {
      console.log("data:", data);
    },
    onError: (error, newTab, context) => {
      queryClient.setQueryData(["tabs"], context?.previousTabs);
      console.log("error:", error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tabs"] }),
  });
  return {
    mutate,
    isPending,
    isError,
  };
};

export const useDeleteTab = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (body: string): Promise<any> => {
      return await deleteTabAction(body);
    },
    onMutate: async (newTab) => {
      await queryClient.cancelQueries({ queryKey: ["tabs"] });

      const previousTabs = queryClient.getQueryData(["tabs"]);

      queryClient.setQueryData(["tabs"], (old: any) => [...old, newTab]);

      return { previousTabs };
    },
    onSuccess: async (data) => {
      console.log("data:", data);
    },
    onError: (error, newTab, context) => {
      queryClient.setQueryData(["tabs"], context?.previousTabs);
      console.log("error:", error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tabs"] }),
  });
  return {
    mutate,
    isPending,
    isError,
  };
};

export const useSyncTabs = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (body: SyncTabsPayload): Promise<any> => {
      return await replaceUserTabsAction(body);
    },

    onSuccess: async (data) => {
      console.log("data:", data);
    },
    onError: (error, newTab, context) => {
      console.log("error:", error.message);
    },
  });
  return {
    mutate,
    isPending,
    isError,
  };
};
