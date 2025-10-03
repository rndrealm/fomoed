import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/utils/stripe";
import { createCheckoutSession, getCustomerByEmail, validatePriceLookupKey } from "@/lib/stripe/stripe.utils.server";
import { newUserAlreadyHasSubscriptionError, newInvalidPriceLookupKeyError } from "@/lib/api/api.errors";
import { PriceLookupKey } from "@/lib/plans";
import { asNextResponseError } from "@/lib/utils/server.utils";
import { getUsersTableRowUsingAuth } from "@/lib/users/users.utils.server";
import { getReferralIdForUser } from "@/services/queries/referral/server-actions";

export interface CheckoutResponse {
  redirectTo: string;
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const priceLookupKey = payload.priceLookupKey as PriceLookupKey;

  if (!validatePriceLookupKey(priceLookupKey)) {
    return newInvalidPriceLookupKeyError();
  }

  const { data: user, error: userError } = await getUsersTableRowUsingAuth();

  if (userError) {
    return asNextResponseError(userError);
  }

  const url = new URL(request.url);
  const host = url.host;
  const protocol = url.protocol;

  let customer = await getCustomerByEmail(user.email);

  if (!customer) {
    customer = await stripe.customers.create({
      email: user.email,
    });
  }

  const customerSubscriptions = await stripe.subscriptions.list({
    customer: customer.id,
    status: "active",
  });

  if (customerSubscriptions.data.length > 0) {
    return newUserAlreadyHasSubscriptionError();
  }

  const returnUrl = `${protocol}//${host}/pricing`;

  const referralId = await getReferralIdForUser(user.user_id);

  const { data: session, error } = await createCheckoutSession({
    customerId: customer.id,
    priceLookupKey,
    returnUrl,
    canHaveFreeTrial: !user.has_had_free_trial,
    metadata: {
      user_id: user.user_id,
      referral_id: referralId,
      price_lookup_key: priceLookupKey
    }
  });

  if (error) {
    return asNextResponseError(error);
  }

  if (!session) {
    return asNextResponseError({ message: "Failed to create Stripe session", status: 500 });
  }

  if (!session.url) {
    return asNextResponseError({ message: "Could not get stripe session URL.", status: 500 });
  }

  const resData: CheckoutResponse = { redirectTo: session.url };

  return NextResponse.json(resData);
}
