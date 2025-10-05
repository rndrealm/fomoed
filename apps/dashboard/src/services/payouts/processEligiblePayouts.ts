// services/payouts/processEligiblePayouts.ts
import Stripe from "stripe";
import {
  getEligibleCommissionsForPayout,
  updateCommissionStatus,
} from "@/services/queries/stripe-connect/server-action";

interface ProcessResult {
  success: string[];
  failed: Array<{ id: number; error: string }>;
  skipped: Array<{ id: number; reason: string }>;
}

export async function processEligiblePayouts(): Promise<ProcessResult> {
  const results: ProcessResult = {
    success: [],
    failed: [],
    skipped: [],
  };

  try {
    const stripe = new Stripe(process.env.PRIVATE_STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil",
    });
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

        // Create Stripe transfer - if this succeeds, transfer is complete
        const transfer = await stripe.transfers.create({
          amount: Math.round(commission.amount * 100), // Convert to cents
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

        // If we reach here, transfer succeeded
        await updateCommissionStatus(commission.id, {
          status: "Paid",
          stripe_transfer_id: transfer.id,
          payout_date: new Date().toISOString(),
          error_message: null,
        });

        results.success.push(commission.id.toString());
        console.log(`✓ Commission ${commission.id} paid (${transfer.id})`);
      } catch (error: any) {
        // Handle individual commission failure
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
