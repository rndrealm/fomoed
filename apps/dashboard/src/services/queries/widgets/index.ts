import { useMutation, useQuery } from "@tanstack/react-query";
import { SaveLayoutPayload } from "./types";
import { getLayoutsAction, syncLayoutAction } from "./actions";

export const useSyncLayouts = () => {
  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (body: SaveLayoutPayload): Promise<any> => {
      return await syncLayoutAction(body);
    },
    onSuccess: async (data) => {
      console.log("data:", data);
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
