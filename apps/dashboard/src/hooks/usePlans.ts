import { useQuery } from "@tanstack/react-query";
import { PlansV2Response } from "@/app/api/plans-v2/route";

const fetchPlans = async (): Promise<PlansV2Response> => {
  const response = await fetch("/api/plans-v2");

  if (!response.ok) {
    throw new Error("Failed to fetch plans");
  }

  return response.json();
};

export const usePlans = () => {
  return useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
};
