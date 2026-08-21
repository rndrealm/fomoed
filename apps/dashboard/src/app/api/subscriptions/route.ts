import { NextResponse } from "next/server";
import { asNextResponseData } from "@/lib/utils/server.utils";
import type { UserSubscriptionsResponseData, UserSubscriptionsResponse } from "./types";

export type { UserSubscriptionsResponseData, UserSubscriptionsResponse };

export async function GET(): Promise<NextResponse<UserSubscriptionsResponse>> {
  return asNextResponseData<UserSubscriptionsResponseData>({
    activePlan: "pro",
    subscriptions: [],
    hasTrialActive: false,
    hasTrialAvailable: false,
    cancelsIn: null,
    nextPeriodPlan: "pro",
    renewsForUsd: null,
    renewsIn: null,
    trialEndsIn: null,
  });
}
