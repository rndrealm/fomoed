// services/stripe/stripeConnectService.ts
import  getStripe  from "@/lib/utils/stripe";
import Stripe from "stripe";

export class StripeConnectService {
  /**
   * Create a new Stripe Connect account for a user
   */
  static async createConnectAccount(userId: string, userEmail: string): Promise<string> {
    const stripe = getStripe();
    try {
      const account = await stripe.accounts.create({
        type: "express",
        email: userEmail,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          user_id: userId,
        },
      });

      return account.id;
    } catch (error: any) {
      console.error("Error creating Stripe account:", error);
      throw new Error(`Failed to create Stripe account: ${error.message}`);
    }
  }

  /**
   * Create an account link for onboarding
   */
  static async createAccountLink(stripeAccountId: string, refreshUrl: string, returnUrl: string): Promise<string> {
    try {
      const stripe = getStripe();
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: "account_onboarding",
      });

      return accountLink.url;
    } catch (error: any) {
      console.error("Error creating account link:", error);
      throw new Error(`Failed to create account link: ${error.message}`);
    }
  }

  /**
   * Get account details from Stripe
   */
  static async getAccountDetails(stripeAccountId: string): Promise<{
    status: string;
    payoutsEnabled: boolean;
    chargesEnabled: boolean;
    onboardingCompleted: boolean;
    detailsSubmitted: boolean;
    country?: string;
    currency?: string;
    businessType?: string;
    requirementsPending?: string[];
    requirementsErrors?: string[];
  }> {
    try {
      const stripe = getStripe();
      const account = await stripe.accounts.retrieve(stripeAccountId);

      let status = "pending";
      if (account.details_submitted) {
        status = "connected";
      }
      if (account.requirements?.disabled_reason) {
        status = "restricted";
      }
      if (account.charges_enabled === false && account.details_submitted) {
        status = "rejected";
      }

      return {
        status,
        payoutsEnabled: account.payouts_enabled ?? false,
        chargesEnabled: account.charges_enabled ?? false,
        onboardingCompleted: account.details_submitted ?? false,
        detailsSubmitted: account.details_submitted ?? false,
        country: account.country,
        currency: account.default_currency,
        businessType: account.business_type ?? undefined,
        requirementsPending: account.requirements?.currently_due ?? undefined,
        requirementsErrors: account.requirements?.errors?.map((e) => e.reason),
      };
    } catch (error: any) {
      console.error("Error fetching account details:", error);
      throw new Error(`Failed to fetch account details: ${error.message}`);
    }
  }

  /**
   * Create a Stripe transfer (payout)
   */
  static async createTransfer(
    stripeAccountId: string,
    amount: number,
    currency: string,
    description: string,
    metadata: Record<string, string>,
  ): Promise<Stripe.Transfer> {
    try {
      const stripe = getStripe();
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        destination: stripeAccountId,
        description,
        metadata,
      });

      return transfer;
    } catch (error: any) {
      console.error("Error creating transfer:", error);
      throw new Error(`Failed to create transfer: ${error.message}`);
    }
  }

  /**
   * Create a login link for connected account dashboard
   */
  static async createLoginLink(stripeAccountId: string): Promise<string> {
    try {
      const stripe = getStripe();
      const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
      return loginLink.url;
    } catch (error: any) {
      console.error("Error creating login link:", error);
      throw new Error(`Failed to create login link: ${error.message}`);
    }
  }
}
