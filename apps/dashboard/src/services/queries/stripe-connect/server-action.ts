"use server";

import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/utils/supabase/server-client";
import { StripeConnectService } from "@/services/stripe/stripeConnectService";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

/**
 * Get or create Stripe Connect account link for onboarding
 */
export async function getStripeConnectAccountLink() {
  const supabase = await createSupabaseServerClient();
  const query = await createSupabaseServiceClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "You must be logged in to connect Stripe.",
      };
    }

    // Get user email
    const { data: userProfile, error: profileError } = await query
      .from("users")
      .select("email")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      return {
        success: false,
        message: "Failed to retrieve user profile.",
      };
    }

    // Check if user already has a Stripe Connect account
    const { data: existingAccount, error: accountError } = await query
      .from("stripe_connect_accounts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (accountError && accountError.code !== "PGRST116") {
      console.error("Error fetching Stripe account:", accountError);
      return {
        success: false,
        message: "Failed to check existing Stripe account.",
      };
    }

    let stripeAccountId = existingAccount?.stripe_account_id;

    // Create new Stripe Connect account if doesn't exist
    if (!stripeAccountId) {
      try {
        stripeAccountId = await StripeConnectService.createConnectAccount(user.id, userProfile.email);

        // Insert new record into database
        const { error: insertError } = await query.from("stripe_connect_accounts").insert({
          stripe_connect_id: uuidv4(),
          user_id: user.id,
          stripe_account_id: stripeAccountId,
          status: "pending",
          payouts_enabled: false,
          onboarding_completed: false,
        });

        if (insertError) {
          console.error("Error saving Stripe account:", insertError);
          return {
            success: false,
            message: "Failed to save Stripe account.",
          };
        }
      } catch (error: any) {
        console.error("Error creating Stripe account:", error);
        return {
          success: false,
          message: error.message || "Failed to create Stripe account.",
        };
      }
    }

    // Create account link for onboarding
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const accountLinkUrl = await StripeConnectService.createAccountLink(
      stripeAccountId,
      `${baseUrl}/referrals?stripe_refresh=true`,
      `${baseUrl}/referrals?stripe_connected=true`,
    );

    return {
      success: true,
      url: accountLinkUrl,
    };
  } catch (error: any) {
    console.error("Error in getStripeConnectAccountLink:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

/**
 * Get current Stripe Connect account status
 */
export async function getStripeConnectStatus() {
  const supabase = await createSupabaseServerClient();
  const query = await createSupabaseServiceClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "You must be logged in.",
      };
    }

    const { data: stripeAccount, error: accountError } = await query
      .from("stripe_connect_accounts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (accountError && accountError.code !== "PGRST116") {
      console.error("Error fetching Stripe account:", accountError);
      return {
        success: false,
        message: "Failed to fetch Stripe account.",
      };
    }

    if (!stripeAccount) {
      return {
        success: true,
        data: {
          status: "not_connected",
          onboarding_completed: false,
          payouts_enabled: false,
        },
      };
    }

    // Get fresh data from Stripe API
    try {
      if (!stripeAccount.stripe_account_id) {
        return {
          success: false,
          message: "No Stripe account ID found.",
        };
      }
      const accountDetails = await StripeConnectService.getAccountDetails(stripeAccount.stripe_account_id);

      if (!stripeAccount.stripe_connect_id) {
        console.log("Stripe Id missmatch");
        return;
      }

      // Update database with latest status (using stripe_connect_id for WHERE clause)
      const { error: updateError } = await query
        .from("stripe_connect_accounts")
        .update({
          status: accountDetails.status,
          onboarding_completed: accountDetails.onboardingCompleted,
          payouts_enabled: accountDetails.payoutsEnabled,
          connected_at:
            accountDetails.onboardingCompleted && !stripeAccount.connected_at
              ? new Date().toISOString()
              : stripeAccount.connected_at,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_connect_id", stripeAccount.stripe_connect_id);

      if (updateError) {
        console.error("Error updating Stripe account:", updateError);
      }

      return {
        success: true,
        data: {
          status: accountDetails.status,
          onboarding_completed: accountDetails.onboardingCompleted,
          payouts_enabled: accountDetails.payoutsEnabled,
        },
      };
    } catch (error: any) {
      console.error("Error fetching Stripe account details:", error);
      return {
        success: true,
        data: {
          status: stripeAccount.status,
          onboarding_completed: stripeAccount.onboarding_completed,
          payouts_enabled: stripeAccount.payouts_enabled,
        },
      };
    }
  } catch (error: any) {
    console.error("Error in getStripeConnectStatus:", error);
    return {
      success: false,
      message: "Something went wrong.",
    };
  }
}

/**
 * Get Stripe Express dashboard login link
 */
export async function getStripeDashboardLink() {
  const supabase = await createSupabaseServerClient();
  const query = await createSupabaseServiceClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "You must be logged in.",
      };
    }

    const { data: stripeAccount, error: accountError } = await query
      .from("stripe_connect_accounts")
      .select("stripe_account_id")
      .eq("user_id", user.id)
      .single();

    if (accountError) {
      console.error("Error fetching Stripe account:", accountError);
      return {
        success: false,
        message: "No Stripe account connected.",
      };
    }

    if (!stripeAccount.stripe_account_id) {
      return {
        success: false,
        message: "No Stripe account ID found.",
      };
    }

    // Create login link to Stripe Express dashboard
    const loginUrl = await StripeConnectService.createLoginLink(stripeAccount.stripe_account_id);

    return {
      success: true,
      url: loginUrl,
    };
  } catch (error: any) {
    console.error("Error in getStripeDashboardLink:", error);
    return {
      success: false,
      message: "Failed to create dashboard link.",
    };
  }
}

/**
 * Handle Stripe Connect webhook account.updated event
 * Called from webhook endpoint
 */
export async function handleStripeAccountUpdated(stripeAccountId: string, accountData: any) {
  const query = await createSupabaseServiceClient();

  try {
    let status: string = "pending";

    if (accountData.details_submitted) {
      status = "connected";
    }
    if (accountData.requirements?.disabled_reason) {
      status = "restricted";
    }
    if (accountData.charges_enabled === false && accountData.details_submitted) {
      status = "rejected";
    }

    // Find the account by Stripe account ID
    const { data: existingAccount, error: findError } = await query
      .from("stripe_connect_accounts")
      .select("stripe_connect_id, user_id, connected_at")
      .eq("stripe_account_id", stripeAccountId)
      .single();

    if (findError) {
      console.error("Error finding Stripe account:", findError);
      return { success: false };
    }

    if (!existingAccount.stripe_connect_id) {
      console.log("Stripe Id missmatch");
      return;
    }

    // Update the account status (using stripe_connect_id for WHERE clause)
    const { error: updateError } = await query
      .from("stripe_connect_accounts")
      .update({
        status,
        onboarding_completed: accountData.details_submitted ?? false,
        payouts_enabled: accountData.payouts_enabled ?? false,
        connected_at:
          accountData.details_submitted && !existingAccount.connected_at
            ? new Date().toISOString()
            : existingAccount.connected_at,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_connect_id", existingAccount.stripe_connect_id);

    if (updateError) {
      console.error("Error updating Stripe account:", updateError);
      return { success: false };
    }

    // Revalidate referrals page
    revalidatePath("/referrals");

    return { success: true };
  } catch (error: any) {
    console.error("Error in handleStripeAccountUpdated:", error);
    return { success: false };
  }
}

/**
 * Handle Stripe transfer webhook events
 * Called from webhook endpoint
 */
export async function handleStripeTransferEvent(
  transferId: string,
  commissionId: string,
  status: "processing" | "paid" | "failed",
  failureMessage?: string,
) {
  const query = await createSupabaseServiceClient();

  try {
    const updateData: any = {
      status: status === "paid" ? "Paid" : status === "failed" ? "Failed" : "Processing",
      updated_at: new Date().toISOString(),
    };

    if (status === "processing") {
      updateData.stripe_transfer_id = transferId;
    }

    if (status === "paid") {
      updateData.payout_date = new Date().toISOString();
      updateData.error_message = null;
    }

    if (status === "failed") {
      updateData.error_message = failureMessage || "Transfer failed";
    }

    // Update using id (integer) since commission_id from metadata is string
    const { error: updateError } = await query
      .from("referral_commissions")
      .update(updateData)
      .eq("id", parseInt(commissionId));

    if (updateError) {
      console.error("Error updating commission:", updateError);
      return { success: false };
    }

    revalidatePath("/referrals");

    return { success: true };
  } catch (error: any) {
    console.error("Error in handleStripeTransferEvent:", error);
    return { success: false };
  }
}

/**
 * Get eligible commissions for payout processing (used by cron job)
 */
export async function getEligibleCommissionsForPayout() {
  const query = await createSupabaseServiceClient();

  try {
    const { data: commissions, error: commissionsError } = await query
      .from("referral_commissions")
      .select(
        `
        id,
        referral_id,
        amount,
        status,
        billing_period_start,
        billing_period_end,
        payout_eligible_date,
        referral:referrals!inner(
          referrer_user_id,
          referred_user_id
        )
      `,
      )
      .in("status", ["Pending", "Failed"])
      .lte("payout_eligible_date", new Date().toISOString())
      .order("created_at", { ascending: true });

    if (commissionsError) {
      console.error("Error fetching eligible commissions:", commissionsError);
      return [];
    }

    if (!commissions || commissions.length === 0) {
      return [];
    }

    // Get unique referrer user IDs
    const referrerUserIds = Array.from(
      new Set(commissions.map((c: any) => c.referral?.referrer_user_id).filter(Boolean)),
    );

    // Get Stripe account info for all referrers
    const { data: stripeAccounts, error: stripeError } = await query
      .from("stripe_connect_accounts")
      .select("stripe_connect_id, user_id, stripe_account_id, payouts_enabled, status")
      .in("user_id", referrerUserIds)
      .eq("status", "connected")
      .eq("payouts_enabled", true);

    if (stripeError) {
      console.error("Error fetching Stripe accounts:", stripeError);
      return [];
    }

    // Get user emails
    const { data: users, error: usersError } = await query
      .from("users")
      .select("user_id, email")
      .in("user_id", referrerUserIds);

    if (usersError) {
      console.error("Error fetching users:", usersError);
    }

    // Create maps for quick lookup
    const stripeAccountMap = new Map((stripeAccounts || []).map((sa: any) => [sa.user_id, sa]));
    const userEmailMap = new Map((users || []).map((u: any) => [u.user_id, u.email]));

    // Filter and enrich commissions with Stripe account info
    const enrichedCommissions = commissions
      .map((commission: any) => {
        const referrerUserId = commission.referral?.referrer_user_id;
        const stripeAccount = referrerUserId ? stripeAccountMap.get(referrerUserId) : null;
        const email = referrerUserId ? userEmailMap.get(referrerUserId) : null;

        if (!stripeAccount) {
          return null; // Skip if no valid Stripe account
        }

        return {
          ...commission,
          referrer: {
            user_id: referrerUserId,
            email: email || "N/A",
            stripeAccount: {
              stripe_account_id: stripeAccount.stripe_account_id,
              payouts_enabled: stripeAccount.payouts_enabled,
              status: stripeAccount.status,
            },
          },
        };
      })
      .filter(Boolean);

    return enrichedCommissions;
  } catch (error: any) {
    console.error("Error in getEligibleCommissionsForPayout:", error);
    return [];
  }
}

/**
 * Update commission status (used by payout processing)
 */
export async function updateCommissionStatus(
  commissionId: number,
  data: {
    status?: string;
    stripe_transfer_id?: string;
    payout_date?: string;
    error_message?: string | null;
  },
) {
  const query = await createSupabaseServiceClient();

  try {
    // Update using id (integer primary key)
    const { error: updateError } = await query
      .from("referral_commissions")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commissionId);

    if (updateError) {
      console.error("Error updating commission:", updateError);
      return { success: false };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateCommissionStatus:", error);
    return { success: false };
  }
}
