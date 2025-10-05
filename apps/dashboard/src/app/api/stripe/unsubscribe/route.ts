import getStripe from "@/lib/utils/stripe";
import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";
import { NextResponse, NextRequest } from "next/server";
import type Stripe from "stripe";

export type UnsubscribeResponseBody = {
  success: boolean;
  message?: string;
  toCancelSubscriptions?: Stripe.Subscription[];
  canceledSubscriptionIds?: string[];
  failedToCancelSubscriptionIds?: string[];
};

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  // Query user from the DB
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!userData) {
    return NextResponse.json(
      { success: false, message: "User was not found in the DB" },
      { status: 404 },
    );
  }

  // Search for all customers with the user's email
  const user_customers = await stripe.customers.search({
    query: `email:"${user.email}"`,
  });

  const user_subscriptions = [];

  for (const customer of user_customers.data) {
    const customer_subs = await stripe.subscriptions.list({
      customer: customer.id,
    });

    user_subscriptions.push(...customer_subs.data);
  }

  // Filter for active subscriptions that can be canceled
  const activeSubscriptions = user_subscriptions.filter(
    (sub) => sub.status === "active" || sub.status === "trialing",
  );

  if (activeSubscriptions.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "No active subscriptions found to cancel",
      },
      { status: 400 },
    );
  }

  // Cancel all active subscriptions at the end of their current periods
  const toCancelSubscriptions: Stripe.Subscription[] = [];
  const canceledSubscriptionIds: string[] = [];
  const failedToCancelSubscriptionIds: string[] = [];

  for (const subscription of activeSubscriptions) {
    toCancelSubscriptions.push(subscription);

    try {
      const canceledSubscription = await stripe.subscriptions.update(
        subscription.id,
        {
          cancel_at_period_end: true,
        },
      );

      canceledSubscriptionIds.push(canceledSubscription.id);
    } catch (error) {
      failedToCancelSubscriptionIds.push(subscription.id);
    }
  }

  return NextResponse.json({
    success: true,
    message: `${canceledSubscriptionIds.length} subscription(s) have been scheduled for cancellation at the end of the current billing period`,
    canceledSubscriptionIds,
    toCancelSubscriptions,
    failedToCancelSubscriptionIds,
  });
}
