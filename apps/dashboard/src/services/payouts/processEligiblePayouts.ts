// services/payouts/processEligiblePayouts.ts
import getStripe from "@/lib/utils/stripe";
import {
  getEligibleCommissionsForPayout,
  updateCommissionStatus,
} from "@/services/queries/stripe-connect/server-action";
import { createSupabaseServiceClient } from "@/lib/utils/supabase/server-client";

interface ProcessResult {
  success: string[];
  failed: Array<{ id: number; error: string }>;
  skipped: Array<{ id: number; reason: string }>;
}

async function checkUserHasActiveProPlan(userId: string): Promise<boolean> {
  const stripe = getStripe();
  const supabase = await createSupabaseServiceClient();

  try {
    // Get user email
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("user_id", userId)
      .single();

    if (!user?.email) return false;

    // Search Stripe customers
    const customers = await stripe.customers.search({
      query: `email:"${user.email}"`,
    });

    if (customers.data.length === 0) return false;

    const customer = customers.data[0];

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      expand: ["data.items.data.price.product"],
    });

    // Check for Pro or Plus plan
    const plansIdMap = {
      pro: process.env.STRIPE_PRODUCT_IDS_PRO_PLAN?.split(",").map((id) => id.trim()) || [],
      plus: process.env.STRIPE_PRODUCT_IDS_PLUS_PLAN?.split(",").map((id) => id.trim()) || [],
    };

    return subscriptions.data.some((sub) => {
      const prodId = sub.items.data?.[0]?.plan?.product;
      return (
        plansIdMap.pro.includes(prodId as string) ||
        plansIdMap.plus.includes(prodId as string)
      );
    });
  } catch (error) {
    console.error(`Error checking subscription for user ${userId}:`, error);
    return false;
  }
}

export async function processEligiblePayouts(): Promise<ProcessResult> {
  const results: ProcessResult = {
    success: [],
    failed: [],
    skipped: [],
  };

  const stripe = getStripe();

  try {
    // 1. Fetch eligible commissions from database
    const eligibleCommissions = await getEligibleCommissionsForPayout();

    console.log(`Found ${eligibleCommissions.length} eligible commissions to process`);

    if (eligibleCommissions.length === 0) {
      return results;
    }

    // 2. Process each commission
    for (const commission of eligibleCommissions) {
      try {
        const stripeAccount = commission.referrer?.stripeAccount;
        const stripeAccountId = stripeAccount?.stripe_account_id;
        const payoutsEnabled = stripeAccount?.payouts_enabled;
        const accountStatus = stripeAccount?.status;
        const referrerUserId = commission.referrer?.user_id;

        // Double-check: Verify referrer still has active Pro/Plus subscription
        const hasActivePlan = await checkUserHasActiveProPlan(referrerUserId);

        if (!hasActivePlan) {
          results.skipped.push({
            id: commission.id,
            reason: "Referrer no longer has active Pro/Plus subscription",
          });
          
          await updateCommissionStatus(commission.id, {
            status: "Pending",
            error_message: "Referrer subscription expired",
          });
          
          continue;
        }

        // Skip if no Stripe account
        if (!stripeAccountId) {
          results.skipped.push({
            id: commission.id,
            reason: "No Stripe account connected",
          });
          continue;
        }

        // Skip if payouts not enabled
        if (!payoutsEnabled) {
          results.skipped.push({
            id: commission.id,
            reason: "Payouts not enabled on Stripe account",
          });
          continue;
        }

        // Skip if account not in connected status
        if (accountStatus !== "connected") {
          results.skipped.push({
            id: commission.id,
            reason: `Stripe account status: ${accountStatus}`,
          });
          continue;
        }

        // Update status to processing
        await updateCommissionStatus(commission.id, {
          status: "Processing",
        });

        // Create Stripe transfer
        const transfer = await stripe.transfers.create({
          amount: Math.round(commission.amount * 100),
          currency: "usd",
          destination: stripeAccountId,
          description: `Referral commission for ${commission.referrer.email}`,
          metadata: {
            commission_id: commission.id.toString(),
            referrer_user_id: commission.referrer.user_id,
            referral_id: commission.referral_id,
            billing_period_start: commission.billing_period_start,
            billing_period_end: commission.billing_period_end,
          },
        });

        // Mark as paid
        await updateCommissionStatus(commission.id, {
          status: "Paid",
          stripe_transfer_id: transfer.id,
          payout_date: new Date().toISOString(),
          error_message: null,
        });

        results.success.push(commission.id.toString());
        console.log(`✓ Commission ${commission.id} paid (${transfer.id})`);
      } catch (error: any) {
        await updateCommissionStatus(commission.id, {
          status: "Failed",
          error_message: error.message,
        });

        results.failed.push({
          id: commission.id,
          error: error.message,
        });

        console.error(`✗ Commission ${commission.id} failed:`, error.message);
      }
    }

    console.log("Payout processing completed:", {
      total: eligibleCommissions.length,
      success: results.success.length,
      failed: results.failed.length,
      skipped: results.skipped.length,
    });

    return results;
  } catch (error: any) {
    console.error("Fatal error in processEligiblePayouts:", error);
    throw error;
  }
}