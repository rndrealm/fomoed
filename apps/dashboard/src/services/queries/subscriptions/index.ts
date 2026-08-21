/**
 * @deprecated
 * Paywall disabled — always returns PRO-level access.
 */
export const useGetUserPlans = () => {
  type LegacyPlanType = "FREE" | "PRO" | "PLUS";

  type LegacyData = {
    hasPlan: boolean;
    hasTrial: boolean;
    planType: LegacyPlanType;
    hasActivePlans: LegacyPlanType;
  }

  const ret: {isPending: boolean, isSuccess: boolean, error: unknown, data: LegacyData | undefined} = {
    isPending: false,
    isSuccess: true,
    error: null,
    data: {
      hasPlan: true,
      hasTrial: false,
      planType: "PRO",
      hasActivePlans: "PRO",
    }
  };

  return ret;
};
