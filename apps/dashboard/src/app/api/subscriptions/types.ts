import type Stripe from "stripe";
import { PlanType } from "@/lib/plans/plans.types";

export type UserSubscriptionsResponseData = {
  subscriptions: Stripe.Subscription[];
  hasTrialActive: boolean;
  hasTrialAvailable: boolean;
  nextPeriodPlan: PlanType;
  activePlan: PlanType;
  renewsIn: string | null;
  cancelsIn: string | null;
  renewsForUsd: number | null;
  trialEndsIn: string | null;
};

export type UserSubscriptionsResponse = {
  success: boolean;
  data?: UserSubscriptionsResponseData;
  message?: string;
};
