import stripe from "@/lib/utils/stripe";
import { getDynamicPlanDataMap, PriceLookupKey, priceLookupKeys } from "@/lib/plans";
import { TRIAL_PERIOD_DAYS } from "@/lib/plans/plans.utils";
import Stripe from "stripe";
import {
  ErrorOrData,
  ErrorWrapper,
  makeErrorOrData,
  makeErrorWrapper,
  propagateErrorOrData,
} from "../utils/server.utils";

export function validatePriceLookupKey(priceLookupKey: string): boolean {
  return priceLookupKeys.includes(priceLookupKey as PriceLookupKey);
}

export async function getStripeSubscriptionsByEmail(email: string) {
  const customers = await stripe.customers.search({
    query: `email:"${email}"`,
  });

  const userSubscriptions = [];

  for (const customer of customers.data) {
    const customerSubs = await stripe.subscriptions.list({
      customer: customer.id,
    });

    userSubscriptions.push(...customerSubs.data);
  }

  return userSubscriptions;
}

export async function getCustomerByEmail(email: string) {
  const customers = await stripe.customers.search({
    query: `email:"${email}"`,
  });

  return customers.data[0] || null;
}

interface CreateCheckoutSessionOpts {
  customerId: string;
  priceLookupKey: PriceLookupKey;
  returnUrl: string;
  canHaveFreeTrial: boolean;
  metadata?: { [key: string]: any };
}

export async function getPriceIdByLookupKey(priceLookupKey: PriceLookupKey): Promise<ErrorOrData<string>> {
  const planDataMap = await getDynamicPlanDataMap();
  const priceId = planDataMap[priceLookupKey]?.priceId;

  if (!priceId) {
    return makeErrorOrData("Price ID not found for the given price lookup key.", 404);
  }

  return { data: priceId };
}

export async function createCheckoutSession({
  customerId,
  canHaveFreeTrial,
  priceLookupKey,
  returnUrl,
  metadata,
}: CreateCheckoutSessionOpts): Promise<ErrorOrData<Stripe.Checkout.Session>> {
  const { data: priceId, error: priceError } = await getPriceIdByLookupKey(priceLookupKey);

  if (priceError) {
    return propagateErrorOrData(priceError);
  }

 const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
    metadata: metadata,
  };

  if (canHaveFreeTrial) {
    subscriptionData.trial_period_days = TRIAL_PERIOD_DAYS;
    subscriptionData.trial_settings = {
      end_behavior: {
        missing_payment_method: "cancel",
      },
    };
  }


  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: returnUrl,
    cancel_url: returnUrl,
    
    // Pass the metadata to the top-level Checkout Session
    metadata: metadata,

    // Pass our constructed subscriptionData object here
    subscription_data: subscriptionData,
  });

  return { data: session };
}
