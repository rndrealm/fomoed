import { useMutation } from "@tanstack/react-query";
import { SaveLayoutPayload } from "./types";
import { syncLayoutAction } from "./actions";

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
