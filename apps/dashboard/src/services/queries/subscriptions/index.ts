import useSubscription from "@/hooks/subscription";

/**
 * @deprecated
 * @returns
 */
export const useGetUserPlans = () => {
  const {activePlan, userSubscriptionsQuery, userSubscriptionQueryData} = useSubscription();

  type LegacyPlanType = "FREE" | "PRO" | "PLUS";

  type LegacyData = {
    // If a plan is active
    hasPlan: boolean;

    // If a trialing subscription is in progress
    hasTrial: boolean;

    planType: LegacyPlanType;

    hasActivePlans: LegacyPlanType;
  }

  const planTypeToLegacyPlanType: Record<string, "FREE" | "PRO" | "PLUS"> = {
    "basic": "FREE",
    "pro": "PRO",
    "plus": "PLUS"
  };

  const ret: {isPending: boolean, isSuccess: boolean, error: unknown, data: LegacyData | undefined} = {
    isPending: userSubscriptionsQuery.isFetching,
    isSuccess: userSubscriptionsQuery.isSuccess,
    error: userSubscriptionsQuery.error,
    data: {
      hasPlan: activePlan !== "basic",
      hasTrial: userSubscriptionQueryData?.hasTrialActive || false,
      planType: planTypeToLegacyPlanType[activePlan || "basic"] || "FREE",
      hasActivePlans: planTypeToLegacyPlanType[activePlan || "basic"] || "FREE",
    }
  };

  return ret;
};
