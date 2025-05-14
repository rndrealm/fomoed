import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "./actions";

export const useGetDashboardData = () => {
  const hash = ["home"];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await getDashboardData();
      return response;
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
