"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { CheckoutResponse } from "@/app/api/stripe/checkout/route";
import { BillingPeriod, PlanType, PriceLookupKey } from "@/lib/plans/plans.types";
import { UserSubscriptionsResponseData } from "@/app/api/subscriptions/route";
import { atom, useAtom } from "jotai";
import { useSupabaseAuth } from "@/components/providers";
import { useRouter } from "next/navigation";
import { useState } from "react";

const loggedOutSubscriptionsResponseData: UserSubscriptionsResponseData = {
  activePlan: "basic",
  nextPeriodPlan: "basic",
  hasTrialActive: false,
  hasTrialAvailable: false,
  subscriptions: [],
  cancelsIn: null,
  renewsIn: null,
  renewsForUsd: null,
  trialEndsIn: null,
};

export type SubscriptionAction = "sub" | "unsub" | "switch-to" | "resub";
export type SubscriptionState = "basic" | "pro-pro" | "plus-plus" | "pro-plus" | "pro-basic" | "plus-basic";

export type PricingPageConfig = {
  proBtnContent: string;
  plusBtnContent: string;
  proBtnAction: SubscriptionAction;
  plusBtnAction: SubscriptionAction;
  proBtnColorProminent: boolean;
};

export const subscriptionActionsPendingAtom = atom(new Set<string>());

function getBtnContent(action: SubscriptionAction, planName: "Pro" | "Plus", canHaveFreeTrial: boolean) {
  const actionToContentMap: Record<SubscriptionAction, string> = {
    sub: planName === "Pro" && canHaveFreeTrial ? "Start a free trial" : `Get ${planName}`,
    unsub: "Unsubscribe",
    "switch-to": `Switch to ${planName}`,
    resub: "Resubscribe",
  };

  return actionToContentMap[action];
}

export function subscriptionStateToConfig(state: SubscriptionState, canHaveFreeTrial: boolean): PricingPageConfig {
  const stateConfigurations: Record<
    SubscriptionState,
    { proBtnAction: SubscriptionAction; plusBtnAction: SubscriptionAction }
  > = {
    basic: { proBtnAction: "sub", plusBtnAction: "sub" },
    "pro-pro": { proBtnAction: "unsub", plusBtnAction: "switch-to" },
    "plus-plus": { proBtnAction: "switch-to", plusBtnAction: "unsub" },
    "pro-plus": { proBtnAction: "switch-to", plusBtnAction: "unsub" },
    "pro-basic": { proBtnAction: "resub", plusBtnAction: "switch-to" },
    "plus-basic": { proBtnAction: "switch-to", plusBtnAction: "resub" },
  };

  const stateConfiguration = stateConfigurations[state];

  const proBtnColorProminent =
    stateConfiguration.proBtnAction === "sub" ||
    stateConfiguration.proBtnAction === "switch-to" ||
    stateConfiguration.proBtnAction === "resub";

  return {
    proBtnContent: getBtnContent(stateConfiguration.proBtnAction, "Pro", canHaveFreeTrial),
    plusBtnContent: getBtnContent(stateConfiguration.plusBtnAction, "Plus", canHaveFreeTrial),
    proBtnAction: stateConfiguration.proBtnAction,
    plusBtnAction: stateConfiguration.plusBtnAction,
    proBtnColorProminent,
  };
}

export function getSubscriptionState(subscriptionData: UserSubscriptionsResponseData | undefined): SubscriptionState {
  if (!subscriptionData) {
    return "basic";
  }

  if (subscriptionData.activePlan === "basic") {
    return "basic";
  }

  const state = `${subscriptionData.activePlan}-${subscriptionData.nextPeriodPlan}` as SubscriptionState;

  return state;
}

export const useSubscription = () => {
  const router = useRouter();
  const { isLoggedIn, sessionLoadedPromise } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [subscriptionActionsPending, setSubscriptionActionsPending] = useAtom(subscriptionActionsPendingAtom);

  interface ChangeSubscriptionMutationOpts {
    action: SubscriptionAction;
    billingPeriod: BillingPeriod;
    plan: PlanType;
  }

  const changeSubscriptionMutation = useMutation({
    mutationFn: async ({ action, billingPeriod, plan }: ChangeSubscriptionMutationOpts) => {
      if (!isLoggedIn) {
        setIsRedirecting(true);
        router.push("/auth/login");
        return;
      }

      setSubscriptionActionsPending((s) => {
        s.add("sub-mutation");
        return s;
      });
      const priceLookupKey = (plan + "_" + billingPeriod) as PriceLookupKey;

      const url = {
        sub: "/api/stripe/checkout",
        unsub: "/api/stripe/unsubscribe",
        resub: "/api/stripe/resubscribe",
        "switch-to": `/api/stripe/switch-to`,
      }[action];

      const res = await api.post<CheckoutResponse>({
        url,
        body: { priceLookupKey },
      });

      if (res.redirectTo) {
        setIsRedirecting(true);
        window.location.href = res.redirectTo;
      }

      queryClient.invalidateQueries({ queryKey: ["user-subscriptions"] });
    },
    onSettled: () => {
      setSubscriptionActionsPending((c) => {
        c.delete("sub-mutation");
        return c;
      });
    },
  });

  const userSubscriptionsQuery = useQuery({
    queryKey: ["user-subscriptions", isLoggedIn],
    queryFn: async () => {
      await sessionLoadedPromise;

      if (!isLoggedIn) {
        return loggedOutSubscriptionsResponseData;
      }

      setSubscriptionActionsPending((s) => {
        s.add("sub-mutation");
        return s;
      });

      try {
        const response = await api.get({
          url: `/api/subscriptions`,
        });

        return response.data as UserSubscriptionsResponseData;
      } finally {
        setSubscriptionActionsPending((c) => {
          c.delete("sub-mutation");
          return c;
        });
      }
    },
    refetchOnWindowFocus: true,
  });

  const isProPlanActive = userSubscriptionsQuery.data?.activePlan === "pro";
  const isPlusPlanActive = userSubscriptionsQuery.data?.activePlan === "plus";
  const activePlan = userSubscriptionsQuery.data?.activePlan;

  const isBusy = !!subscriptionActionsPending.size || userSubscriptionsQuery.isFetching || isRedirecting;

  return {
    userSubscriptionsQuery,
    userSubscriptionQueryData: userSubscriptionsQuery.data,
    isProPlanActive,
    isPlusPlanActive,
    activePlan,
    changeSubscriptionMutation,
    isBusy,
    isInitialLoading: !userSubscriptionsQuery.isFetched,
  };
};

export default useSubscription;
