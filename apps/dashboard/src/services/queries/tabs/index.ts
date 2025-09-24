import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTabAction,
  deleteTabAction,
  getUserTabsAction,
  replaceUserAvatar,
  replaceUsername,
  replaceUserTabsAction,
} from "./actions";
import { AddTabPayload, SyncTabsPayload } from "./types";

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

export const useUpdateUsername = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (body: { username: string }): Promise<any> => {
      return await replaceUsername(body);
    },

    onSuccess: async (data) => {
      console.log("data:", data);

      // refetches user data after successful username update
      await queryClient.invalidateQueries({
        queryKey: ["userData"],
      });
    },
    onError: (error, newTab, context) => {
      console.log("error:", error.message);
    },
  });
  return {
    updateUsername: mutate,
    isPending,
    isError,
  };
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (body: { avatar_url: string }): Promise<any> => {
      return await replaceUserAvatar(body);
    },

    onSuccess: async (data) => {
      console.log("data:", data);

      // refetches user data after successful username update
      await queryClient.invalidateQueries({
        queryKey: ["userData"],
      });
    },
    onError: (error, newTab, context) => {
      console.log("error:", error.message);
    },
  });
  return {
    updateAvatar: mutate,
    isPending,
    isError,
  };
};
