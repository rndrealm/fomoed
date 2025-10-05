import { AppRoutes } from "@/lib/routes";
import stripe from "@/lib/utils/stripe";
import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { PlanType } from "@/lib/plans/plans.types";
import { unixToRenewsIn } from "@/lib/plans/plans.utils";
import { setHasHadFreeTrial } from "@/lib/users/users.utils.server";
import { asNextResponseData } from "@/lib/utils/server.utils";

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

const plansIdMap = {
  pro: process.env.STRIPE_PRODUCT_IDS_PRO_PLAN?.split(",").map((id) => id.trim()) || [],
  plus: process.env.STRIPE_PRODUCT_IDS_PLUS_PLAN?.split(",").map((id) => id.trim()) || [],
};

export async function GET(): Promise<NextResponse<UserSubscriptionsResponse>> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Get the current URL from headers to use as the next parameter
    const headersList = await headers();
    const referer = headersList.get("referer") || "";
    const currentUrl = referer ? new URL(referer).pathname + new URL(referer).search : "";

    redirect(AppRoutes.auth.login.withNext(currentUrl));
  }

  // Query user from the DB
  const { data: userData, error: userError } = await supabase.from("users").select("*").eq("user_id", user.id).single();

  if (!userData) {
    console.error("User not found in DB", userError);
    throw new Error("user was not found in the DB");
  }

  const userCustomers = await stripe.customers.search({
    query: `email:"${user.email}"`,
  });

  if (userCustomers.data.length > 1) {
    console.warn("Multiple customers found for user, using the first one.");
  }

  const noSubResponse = asNextResponseData<UserSubscriptionsResponseData>({
    activePlan: "basic",
    subscriptions: [],
    hasTrialActive: false,
    hasTrialAvailable: !userData.has_had_free_trial,
    cancelsIn: null,
    nextPeriodPlan: "basic",
    renewsForUsd: null,
    renewsIn: null,
    trialEndsIn: null,
  });

  const customer = userCustomers.data[0];

  if (!customer) {
    return noSubResponse;
  }

  // Fix: Remove product expansion to stay within Stripe's 4-level limit
  const customerSubs = await stripe.subscriptions.list({
    customer: customer.id,
    expand: ['data.items.data.price'],
  });
  const activeAndTrialingSubs = customerSubs.data.filter((sub) => sub.status === "active" || sub.status === "trialing");

  // The active sub shown needs to always be the sub with the highest price
  const highestPriceSub =
    activeAndTrialingSubs.length > 0
      ? activeAndTrialingSubs.reduce((prev, curr) => {
          // @ts-expect-error The subs always have items, if not it's not gonna work anyways
          return prev.items.data[0].price.unit_amount > curr.items.data[0].price.unit_amount ? prev : curr;
        })
      : undefined;

  const activeSub: Stripe.Subscription | undefined = highestPriceSub;

  if (!activeSub) {
    return noSubResponse;
  }

  let upcomingSub: Stripe.Subscription | undefined;

  if (activeAndTrialingSubs.length > 2) {
    console.error("User has multiple active subscriptions, this is unexpected, but continuing...");
  }

  // Upcoming sub is either the current sub or a trialing sub, which is trialing
  // in order to be activated next period (when downgragin from Pro to Plus)
  if (activeSub.cancel_at_period_end && activeAndTrialingSubs.length > 1) {
    // Find upcoming plus subscription when downgrading from pro to plus
    upcomingSub = activeAndTrialingSubs.find(
      (sub) => sub.id !== activeSub.id && sub.status === "trialing" && sub.cancel_at_period_end !== true,
    );
  } else {
    upcomingSub = activeSub.cancel_at_period_end ? undefined : activeSub;
  }

  let isTrialing = false;

  const prodId = activeSub.items.data?.[0]?.plan?.product;
  const willCancel = activeSub.cancel_at_period_end;

  let activePlan: PlanType = "basic";
  let upcomingPlan: PlanType = "basic";

  if (plansIdMap.pro.includes(prodId as string)) {
    activePlan = "pro";
  }

  if (plansIdMap.plus.includes(prodId as string)) {
    activePlan = "plus";
  }

  if (activeSub.status === "trialing") {
    isTrialing = true;
  }

  const upcomingSubProdId = upcomingSub?.items.data[0]?.plan?.product;

  if (plansIdMap.pro.includes(upcomingSubProdId as string)) {
    upcomingPlan = "pro";
  }

  if (plansIdMap.plus.includes(upcomingSubProdId as string)) {
    upcomingPlan = "plus";
  }

  // Fix: current_period_end is on the subscription items, not the subscription itself
  const renewsIn = !activeSub || !upcomingSub ? null : unixToRenewsIn(upcomingSub.items.data[0].current_period_end);
  const cancelsIn = activeSub?.cancel_at_period_end ? unixToRenewsIn(activeSub.items.data[0].current_period_end) : null;
  const renewsForUsd = upcomingSub?.items.data[0].price.unit_amount || null;
  const trialEndsIn = isTrialing ? unixToRenewsIn(activeSub.items.data[0].current_period_end) : null;

  // This should be done via webhook, but for now we do it like this
  // theoretically if the user never opens the page after subscribing,
  // they would be able to get the free trial again, but I guess that's fine :)
  if (isTrialing && !userData.has_had_free_trial) {
    const { error } = await setHasHadFreeTrial(user.id, true);

    if (error) {
      console.warn("Failed to set has_had_free_trial for user", error);
    }

    userData.has_had_free_trial = true;
  }

  // console.log({upcomingInvoice})

  return asNextResponseData({
    subscriptions: activeAndTrialingSubs,
    hasTrialActive: isTrialing,
    activePlan,
    nextPeriodPlan: upcomingPlan,
    hasTrialAvailable: !userData.has_had_free_trial,
    renewsIn,
    renewsForUsd,
    cancelsIn,
    trialEndsIn,
  });
}