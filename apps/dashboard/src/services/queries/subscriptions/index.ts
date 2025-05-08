import { useQuery } from "@tanstack/react-query";
import { getActivePlan } from "./actions";
import api from "@/services/api";

export const useGetActiveSubs = () => {
  const hash = ["subs"];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await getActivePlan();
      return response;
    },
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};

export const useGetUserPlans = () => {
  const hash = ["plans"];
  const { data, isPending, error, isSuccess } = useQuery<any>({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/subscriptions`,
      });
      return response.data;
      console.log("response", response);
    },
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};
