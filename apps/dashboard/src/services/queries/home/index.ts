import { useQuery } from "@tanstack/react-query";
import { getDashboardDataClient } from "./server-actions";

export const useReadDashboardData = (userId: string) => {
  const hash = ["read-dashboard-data", userId];
  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await getDashboardDataClient(userId);
      return response;
    },
    enabled: !!userId,
    refetchInterval: Infinity,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });

  return res;
};
