// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/utils/stripe";
import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";
import { headers } from "next/headers";

const WEBHOOK_SECRET = process.env.PRIVATE_STRIPE_WEBHOOK_SECRET! as string;

// Define your plan amounts for commission calculation
const PLAN_COMMISSION_MAP = {
  pro_monthly: 9.99, // $9.99 for monthly pro
  pro_yearly: 119.88, // 12 * $9.99 for yearly pro
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");

    if (!sig) {
      console.error("No Stripe signature found");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("Processing checkout session:", session.id);

      await handleCheckoutSessionCompleted(session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    const supabase = await createSupabaseServerClient();

    // Extract metadata
    const referralId = session.metadata?.referral_id;
    const userId = session.metadata?.user_id;

    console.log("Session metadata:", { referralId, userId });

    if (!referralId) {
      console.log("No referral ID found in session metadata");
      return;
    }

    // Get the subscription to find the plan
    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
      console.log("No subscription found in session");
      return;
    }
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;

    // You'll need to determine which plan this is based on the price ID
    // For now, let's assume we can get the lookup key from the price
    const price = await stripe.prices.retrieve(priceId);
    const priceLookupKey = price.lookup_key;

    // Check if this is a pro plan that gets commission
    if (!priceLookupKey?.startsWith("pro_")) {
      console.log("Plan does not qualify for referral commission:", priceLookupKey);
      return;
    }

    const commissionAmount = PLAN_COMMISSION_MAP[priceLookupKey as keyof typeof PLAN_COMMISSION_MAP];

    if (!commissionAmount) {
      console.log("No commission defined for plan:", priceLookupKey);
      return;
    }

    // Update referral status to 'Active'
    const { error: updateError } = await supabase
      .from("referrals")
      .update({
        status: "Active",
        updated_at: new Date().toISOString(),
      })
      .eq("referral_id", referralId);

    if (updateError) {
      console.error("Failed to update referral status:", updateError);
      return;
    }

    // Insert commission record
    const { error: insertError } = await supabase.from("referral_commissions").insert({
      referral_id: referralId,
      amount: commissionAmount,
      status: "Pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Failed to insert referral commission:", insertError);
      return;
    }

    console.log(`Successfully processed referral commission: ${referralId} -> $${commissionAmount}`);
  } catch (error) {
    console.error("Error handling checkout session:", error);
  }
}
