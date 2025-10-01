// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/utils/stripe";
import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";
import { headers } from "next/headers";

const WEBHOOK_SECRET = process.env.PRIVATE_STRIPE_WEBHOOK_SECRET! as string;

// Get Pro plan product IDs from environment
const PRO_PRODUCT_IDS = process.env.STRIPE_PRODUCT_IDS_PRO_PLAN?.split(",").map((id) => id.trim()) || [];

// Commission calculation - Fixed $9.99/month for Pro plan only
const COMMISSION_RATES = {
  monthly: 9.99,
  yearly: 119.88, // 12 * 9.99
} as const;

// 30-day payout delay in milliseconds
const PAYOUT_DELAY_MS = 30 * 24 * 60 * 60 * 1000;

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

    console.log(`Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

// Helper function to get referral by user ID
async function getReferralByUserId(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: referral, error } = await supabase
    .from("referrals")
    .select("referral_id, referrer_user_id, status")
    .eq("referred_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching referral:", error);
    return null;
  }

  return referral;
}

// Helper function to check if product is Pro plan
function isProPlan(productId: string): boolean {
  return PRO_PRODUCT_IDS.includes(productId);
}

// Helper function to calculate commission
function calculateCommission(billingInterval: string | null | undefined): number {
  return billingInterval === "year" ? COMMISSION_RATES.yearly : COMMISSION_RATES.monthly;
}

// Helper function to send email notification to referrer
async function sendReferralNotificationEmail(
  referrerUserId: string,
  type: "subscription" | "unsubscribe",
  details: {
    subscriberEmail?: string;
    commissionAmount?: number;
    plan?: string;
  }
) {
  const supabase = await createSupabaseServerClient();

  const { data: referrerUser } = await supabase
    .from("users")
    .select("email")
    .eq("user_id", referrerUserId)
    .single();

  if (!referrerUser?.email) {
    console.log("No referrer email found");
    return;
  }

  // TODO: Implement your email sending logic here
  // Example: await sendEmail({ to: referrerUser.email, ... })
  console.log(`Email notification (${type}) to:`, referrerUser.email, details);
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    const supabase = await createSupabaseServerClient();

    const referralId = session.metadata?.referral_id;
    const userId = session.metadata?.user_id;

    console.log("Checkout session metadata:", { referralId, userId });

    if (!referralId) {
      console.log("No referral ID found in session metadata");
      return;
    }

    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
      console.log("No subscription found in session");
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;
    const price = await stripe.prices.retrieve(priceId);

    const productId = price.product as string;
    const billingInterval = price.recurring?.interval;
    const isTrialing = subscription.status === "trialing";

    console.log("Subscription details:", { productId, billingInterval, isTrialing });

    // Only Pro plans get commissions
    if (!isProPlan(productId)) {
      console.log("Plan does not qualify for referral commission. Product ID:", productId);
      return;
    }

    // Get current referral status
    const { data: currentReferral } = await supabase
      .from("referrals")
      .select("status")
      .eq("referral_id", referralId)
      .single();

    // Check if user already had Pro before
    if (currentReferral?.status === "Active" || currentReferral?.status === "Cancelled") {
      console.log(`Referral already had Pro subscription (status: ${currentReferral.status})`);

      // Reactivate if they're resubscribing (and not on trial)
      if (currentReferral.status === "Cancelled" && !isTrialing) {
        await supabase
          .from("referrals")
          .update({
            status: "Active",
            updated_at: new Date().toISOString(),
          })
          .eq("referral_id", referralId);

        console.log(`Reactivated referral from Cancelled to Active: ${referralId}`);
        
        // Note: No new commission created on resubscribe
        // New commissions will be created on recurring payments
      }

      return;
    }

    // If user is trialing, don't activate referral or create commission yet
    if (isTrialing) {
      console.log(`User is on trial, keeping referral as Pending until first payment`);
      
      // Mark that user has started their trial
      const { error: trialError } = await supabase
        .from("users")
        .update({ has_had_free_trial: true })
        .eq("user_id", userId);

      if (trialError) {
        console.warn("Failed to set has_had_free_trial for user:", trialError);
      }

      return; // Don't activate referral or create commission yet
    }

    // User is paying immediately (no trial) - activate and create first commission
    const commissionAmount = calculateCommission(billingInterval);
    const periodStart = subscription.items.data[0].current_period_start;
    const periodEnd = subscription.items.data[0].current_period_start;

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

    // Insert first commission record
    const { error: insertError } = await supabase.from("referral_commissions").insert({
      referral_id: referralId,
      amount: commissionAmount,
      status: "Pending",
      billing_period_start: new Date(periodStart * 1000).toISOString(),
      billing_period_end: new Date(periodEnd * 1000).toISOString(),
      payout_eligible_date: new Date(Date.now() + PAYOUT_DELAY_MS).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Failed to insert referral commission:", insertError);
      return;
    }

    console.log(`Successfully processed first referral commission: ${referralId} -> $${commissionAmount}`);

    // Email notification disabled
    // const { data: referral } = await supabase
    //   .from("referrals")
    //   .select("referrer_user_id")
    //   .eq("referral_id", referralId)
    //   .single();
    // if (referral) {
    //   await sendReferralNotificationEmail(referral.referrer_user_id, "subscription", {
    //     subscriberEmail: session.customer_email,
    //     commissionAmount,
    //     plan: billingInterval === "year" ? "Pro Yearly" : "Pro Monthly",
    //   });
    // }
  } catch (error) {
    console.error("Error handling checkout session:", error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const supabase = await createSupabaseServerClient();
    const userId = subscription.metadata?.user_id;

    console.log("Subscription deleted for user:", userId);

    if (!userId) {
      console.log("No user_id in subscription metadata");
      return;
    }

    const referral = await getReferralByUserId(userId);

    if (!referral) {
      console.log("No referral found for user:", userId);
      return;
    }

    // Check if this was a Pro subscription
    const deletedPrice = subscription.items.data[0]?.price;
    const deletedProductId = deletedPrice?.product as string;
    const wasProPlan = isProPlan(deletedProductId);

    // Only process Pro subscription cancellations
    if (!wasProPlan) {
      console.log("Deleted subscription was not a Pro plan, no referral status change");
      return;
    }

    // Check if user was on trial (never paid)
    const wasTrialing = subscription.status === "trialing";

    // If referral is Pending and user cancels trial, just log it (no status change needed)
    if (wasTrialing && referral.status === "Pending") {
      console.log("User cancelled during trial, referral stays Pending (no commissions were created)");
      return;
    }

    // Only process if referral is currently Active
    if (referral.status !== "Active") {
      console.log(`Referral status is ${referral.status}, not updating`);
      return;
    }

    // Update referral status to 'Cancelled'
    // This indicates the user is no longer on Pro plan
    const { error: updateError } = await supabase
      .from("referrals")
      .update({
        status: "Cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("referral_id", referral.referral_id);

    if (updateError) {
      console.error("Failed to update referral status to Cancelled:", updateError);
      return;
    }

    // IMPORTANT: Commission records stay "Pending" (not cancelled)
    // Rationale: User already paid for Pro service, referrer earned those commissions
    // Commissions will be marked as "Paid" during payout process after 30-day delay
    // Future recurring commissions will not be created since referral is now Cancelled

    console.log(`Pro subscription cancelled, referral marked as Cancelled: ${referral.referral_id}`);
    console.log(`All earned commissions stay Pending - user paid for service, referrer earned them`);

    // Email notification disabled
    // await sendReferralNotificationEmail(referral.referrer_user_id, "unsubscribe", {
    //   subscriberEmail: userId,
    // });
  } catch (error) {
    console.error("Error handling subscription deletion:", error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    const supabase = await createSupabaseServerClient();
    const userId = subscription.metadata?.user_id;
    const subscriptionStatus = subscription.status;
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;

    console.log("Subscription updated:", { userId, status: subscriptionStatus, cancelAtPeriodEnd });

    if (!userId) {
      console.log("No user_id in subscription metadata");
      return;
    }

    const referral = await getReferralByUserId(userId);

    if (!referral) {
      console.log("No referral found for user:", userId);
      return;
    }

    // Get current subscription details
    const currentPrice = subscription.items.data[0]?.price;
    const currentProductId = currentPrice?.product as string;
    const currentBillingInterval = currentPrice?.recurring?.interval;
    const isTrialing = subscription.status === "trialing";

    const isCurrentlyProPlan = isProPlan(currentProductId);

    // Scenario: User upgrades from Plus to Pro (or reactivates Pro)
    // Only create commission if they've never had Pro before AND they're not on trial
    if (isCurrentlyProPlan && 
        referral.status !== "Active" && 
        referral.status !== "Cancelled" &&
        !isTrialing) {
      
      const commissionAmount = calculateCommission(currentBillingInterval);
      const periodStart = subscription.current_period_start;
      const periodEnd = subscription.current_period_end;

      // Activate referral
      const { error: updateError } = await supabase
        .from("referrals")
        .update({
          status: "Active",
          updated_at: new Date().toISOString(),
        })
        .eq("referral_id", referral.referral_id);

      if (updateError) {
        console.error("Failed to activate referral on upgrade:", updateError);
        return;
      }

      // Create first commission for this billing period (first-time Pro subscribers)
      const { error: insertError } = await supabase.from("referral_commissions").insert({
        referral_id: referral.referral_id,
        amount: commissionAmount,
        status: "Pending",
        billing_period_start: new Date(periodStart * 1000).toISOString(),
        billing_period_end: new Date(periodEnd * 1000).toISOString(),
        payout_eligible_date: new Date(Date.now() + PAYOUT_DELAY_MS).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Failed to create commission on upgrade:", insertError);
        return;
      }

      console.log(`User upgraded to Pro plan (first time), referral activated: ${referral.referral_id} -> ${commissionAmount}`);
      
      // Email notification disabled
      // await sendReferralNotificationEmail(referral.referrer_user_id, "subscription", {
      //   commissionAmount,
      //   plan: currentBillingInterval === "year" ? "Pro Yearly" : "Pro Monthly",
      // });

      return;
    }

    // Scenario: User who previously had Pro (Cancelled status) upgrades back to Pro
    if (isCurrentlyProPlan && referral.status === "Cancelled" && !isTrialing) {
      // Just reactivate, new commissions will be created on recurring payments
      const { error: updateError } = await supabase
        .from("referrals")
        .update({
          status: "Active",
          updated_at: new Date().toISOString(),
        })
        .eq("referral_id", referral.referral_id);

      if (updateError) {
        console.error("Failed to reactivate referral:", updateError);
        return;
      }

      console.log(`User resubscribed to Pro, referral reactivated: ${referral.referral_id}`);
      console.log(`New recurring commissions will be created on future payments`);
      return;
    }

    // Scenario: User downgrades from Pro to Plus
    // When user clicks downgrade, cancel_at_period_end is set to true on Pro subscription
    // We don't change referral status here because user might change their mind
    // The actual status change happens in subscription.deleted when Pro ends
    // No action needed for downgrades during subscription.updated

  } catch (error) {
    console.error("Error handling subscription update:", error);
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    const supabase = await createSupabaseServerClient();
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const userId = subscription.metadata?.user_id;

    console.log("Payment failed for user:", userId);

    if (!userId) {
      console.log("No user_id in subscription metadata");
      return;
    }

    const referral = await getReferralByUserId(userId);

    if (!referral) {
      console.log("No referral found for user:", userId);
      return;
    }

    // Only update if currently Active
    if (referral.status !== "Active") {
      return;
    }

    const { error: updateError } = await supabase
      .from("referrals")
      .update({
        status: "Cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("referral_id", referral.referral_id);

    if (updateError) {
      console.error("Failed to update referral status:", updateError);
      return;
    }

    console.log(`Payment failed for referral: ${referral.referral_id}`);
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    if (!invoice.subscription) {
      console.log(`Invoice ${invoice.id} is not related to a subscription. Skipping referral logic.`);
      return;
    }
    const supabase = await createSupabaseServerClient();
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const userId = subscription.metadata?.user_id;
    const billingReason = invoice.billing_reason;

    console.log("Payment succeeded for user:", userId, "Billing reason:", billingReason);

    if (!userId) {
      console.log("No user_id in subscription metadata");
      return;
    }

    const referral = await getReferralByUserId(userId);

    if (!referral) {
      console.log("No referral found for user:", userId);
      return;
    }

    // Get subscription details
    const currentPrice = subscription.items.data[0]?.price;
    const currentProductId = currentPrice?.product as string;
    const currentBillingInterval = currentPrice?.recurring?.interval;
    const isCurrentlyProPlan = isProPlan(currentProductId);

    if (!isCurrentlyProPlan) {
      console.log("User not on Pro plan, no commission created");
      return;
    }

    const commissionAmount = calculateCommission(currentBillingInterval);
    const periodStart = invoice.period_start;
    const periodEnd = invoice.period_end;

    // Case 1: First payment after trial ends (most important!)
    if (billingReason === "subscription_cycle" && referral.status === "Pending") {
      console.log("First payment after trial - activating referral and creating commission");

      // Activate referral
      const { error: updateError } = await supabase
        .from("referrals")
        .update({
          status: "Active",
          updated_at: new Date().toISOString(),
        })
        .eq("referral_id", referral.referral_id);

      if (updateError) {
        console.error("Failed to update referral status:", updateError);
        return;
      }

      // Check if commission already exists (idempotency)
      const { data: existingCommission } = await supabase
        .from("referral_commissions")
        .select("id")
        .eq("referral_id", referral.referral_id)
        .eq("stripe_invoice_id", invoice.id)
        .single();

      if (existingCommission) {
        console.log("Commission already exists for this invoice");
        return;
      }

      // Create first commission after trial
      const { error: insertError } = await supabase.from("referral_commissions").insert({
        referral_id: referral.referral_id,
        amount: commissionAmount,
        status: "Pending",
        billing_period_start: new Date(periodStart * 1000).toISOString(),
        billing_period_end: new Date(periodEnd * 1000).toISOString(),
        stripe_invoice_id: invoice.id,
        payout_eligible_date: new Date(Date.now() + PAYOUT_DELAY_MS).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Failed to insert referral commission:", insertError);
        return;
      }

      console.log(`Trial ended, first payment succeeded - referral activated: ${referral.referral_id} -> ${commissionAmount}`);
      
      // Email notification disabled
      // await sendReferralNotificationEmail(referral.referrer_user_id, "subscription", {
      //   commissionAmount,
      //   plan: currentBillingInterval === "year" ? "Pro Yearly" : "Pro Monthly",
      // });

      return;
    }

    // Case 2: Monthly/Yearly renewal - CREATE RECURRING COMMISSION
    if (billingReason === "subscription_cycle" && referral.status === "Active") {
      console.log("Recurring payment - creating new commission for this billing period");

      // Check if commission already exists for this period (idempotency)
      const { data: existingCommission } = await supabase
        .from("referral_commissions")
        .select("id")
        .eq("referral_id", referral.referral_id)
        .eq("stripe_invoice_id", invoice.id)
        .single();

      if (existingCommission) {
        console.log("Commission already exists for this invoice, skipping");
        return;
      }

      // Create new commission for this billing period
      const { error: insertError } = await supabase.from("referral_commissions").insert({
        referral_id: referral.referral_id,
        amount: commissionAmount,
        status: "Pending",
        billing_period_start: new Date(periodStart * 1000).toISOString(),
        billing_period_end: new Date(periodEnd * 1000).toISOString(),
        stripe_invoice_id: invoice.id,
        payout_eligible_date: new Date(Date.now() + PAYOUT_DELAY_MS).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Failed to create recurring commission:", insertError);
        return;
      }

      console.log(`Recurring commission created: $${commissionAmount} for period ${new Date(periodStart * 1000).toISOString()}`);

      // Note: You might not want to send email on every renewal
      // Consider sending monthly summary emails instead
      return;
    }

    // Case 3: Payment recovered after failure
    // if (referral.status === "Cancelled") {
    //   const { error: updateError } = await supabase
    //     .from("referrals")
    //     .update({
    //       status: "Active",
    //       updated_at: new Date().toISOString(),
    //     })
    //     .eq("referral_id", referral.referral_id);

    //   if (updateError) {
    //     console.error("Failed to update referral status:", updateError);
    //     return;
    //   }

    //   console.log(`Payment recovered for referral: ${referral.referral_id}`);
      
    //   // If this is a subscription_cycle payment after recovery, create commission
    //   if (billingReason === "subscription_cycle") {
    //     // Check for existing commission
    //     const { data: existingCommission } = await supabase
    //       .from("referral_commissions")
    //       .select("id")
    //       .eq("referral_id", referral.referral_id)
    //       .eq("stripe_invoice_id", invoice.id)
    //       .single();

    //     if (!existingCommission) {
    //       await supabase.from("referral_commissions").insert({
    //         referral_id: referral.referral_id,
    //         amount: commissionAmount,
    //         status: "Pending",
    //         billing_period_start: new Date(periodStart * 1000).toISOString(),
    //         billing_period_end: new Date(periodEnd * 1000).toISOString(),
    //         stripe_invoice_id: invoice.id,
    //         payout_eligible_date: new Date(Date.now() + PAYOUT_DELAY_MS).toISOString(),
    //         created_at: new Date().toISOString(),
    //         updated_at: new Date().toISOString(),
    //       });

    //       console.log(`Commission created after payment recovery: $${commissionAmount}`);
    //     }
    //   }
    // }

  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}