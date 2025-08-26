import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/utils/stripe";
import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";
import type Stripe from "stripe";
import { getStripeSubscriptionsByEmail } from "@/lib/stripe";
import { asNextResponseError } from "@/lib/utils/server.utils";

export interface ResubscribeResponse {
  success: boolean;
  message?: string;
  updatedSubscription?: Stripe.Subscription;
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user?.email || authError) {
    return asNextResponseError({ message: "Unauthorized. Please login before proceeding", status: 403 });
  }
  const { data: userData, error: userError } = await supabase.from("users").select("*").eq("user_id", user.id).single();

  if (userData === null) {
    return asNextResponseError({ message: "User not found in DB.", status: 500 });
  }

  const userSubscriptions = await getStripeSubscriptionsByEmail(user.email);
  const activeSubscription = userSubscriptions.find((sub) => sub.status === "active" || sub.status === "trialing");

  if (!activeSubscription) {
    return asNextResponseError({ message: "No active subscription found to update", status: 404 });
  }

  const updatedSubscription = await stripe.subscriptions.update(activeSubscription.id, {
    cancel_at_period_end: false,
  });

  return NextResponse.json({
    success: true,
    message: "Subscription updated successfully",
    updatedSubscription,
  });
}
