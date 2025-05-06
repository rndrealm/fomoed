import { useQuery } from "@tanstack/react-query";
import { getLayoutsAction } from "./actions";

export const useReadLayouts = () => {
  const hash = ["layouts"];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await getLayoutsAction();
      return response.layouts;
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
