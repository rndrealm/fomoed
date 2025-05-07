import { useQuery } from "@tanstack/react-query";
import { getActivePlan } from "./actions";

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
