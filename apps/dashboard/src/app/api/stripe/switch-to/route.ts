import {
  newCannotFindCustomerError,
  newInvalidPriceLookupKeyError,
  newUserDoesNotHaveActiveSubscriptionError,
} from "@/lib/api/api.errors";
import { PriceLookupKey } from "@/lib/plans";
import { getCustomerByEmail, getPriceIdByLookupKey, validatePriceLookupKey } from "@/lib/stripe/stripe.utils.server";
import { getUsersTableRowUsingAuth } from "@/lib/users/users.utils.server";
import { asNextResponseData, asNextResponseError } from "@/lib/utils/server.utils";
import stripe from "@/lib/utils/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const payload = await request.json();
  const priceLookupKey = payload.priceLookupKey as PriceLookupKey;

  if (!validatePriceLookupKey(priceLookupKey)) {
    return newInvalidPriceLookupKeyError();
  }

  const { data: user, error: userError } = await getUsersTableRowUsingAuth();

  if (userError) {
    return asNextResponseError(userError);
  }

  const customer = await getCustomerByEmail(user.email);

  if (!customer) {
    return newCannotFindCustomerError();
  }

  console.log("TRALALERO TRALALA");

  const subscriptions = await stripe.subscriptions.list({ customer: customer.id });
  const activeOrTrialingSubscriptions = subscriptions.data.filter(
    (sub) => sub.status === "active" || sub.status === "trialing",
  );

  // If there is an active and a trialing subscription, it means that
  // the trialing one is the one that's gonna activate the next billing period
  // Trialing is used to delay the invoice. This means we have to select the one that's
  // not trialing.
  const activeSub = activeOrTrialingSubscriptions.find((sub) => sub.status === "active");
  const trialingSub = activeOrTrialingSubscriptions.find((sub) => sub.status === "trialing");
  const nextPeriodLowerTierSubExists = activeSub && trialingSub;
  const userIsOnTrial = !activeSub && trialingSub;

  let subToEdit: Stripe.Subscription | undefined;

  if (!activeSub && !trialingSub) {
    return asNextResponseError({ message: "Invalid state", status: 500 });
  }

  if (nextPeriodLowerTierSubExists) {
    subToEdit = activeSub;
  } else {
    subToEdit = activeSub || trialingSub;
  }

  if (!subToEdit) {
    return newUserDoesNotHaveActiveSubscriptionError();
  }

  const { data: priceId, error: priceError } = await getPriceIdByLookupKey(priceLookupKey);

  if (priceError) {
    return asNextResponseError(priceError);
  }

  // We prorate only when the user is switching from a lowe tier to a higher tier plan,
  // charging the user the difference. If they are switching from a higher tier to a lower
  // tier plan, they will continue to be in the higher tier plan till the end of the
  // billing period and will be charged the new price at the start of the next billing cycle.

  const switchingToPro = priceLookupKey === "pro_monthly" || priceLookupKey === "pro_yearly";

  let updatedSubscription: Stripe.Subscription;

  if (userIsOnTrial) {
    // Just update the subscription item if the user decides to switch when in trial
    updatedSubscription = await stripe.subscriptions.update(subToEdit.id, {
      items: [
        {
          id: subToEdit.items.data[0].id,
          price: priceId,
        },
      ],
      cancel_at_period_end: false,
    });
  } else if (switchingToPro) {
    // if (subToEdit.schedule) {
    //   console.log("Canceling schedule:", subToEdit.schedule);
    //   await stripe.subscriptionSchedules.cancel(subToEdit.schedule as string);

    //   // Re-fetch the subscription
    //   subToEdit = await stripe.subscriptions.retrieve(subToEdit.id);
    // }
    // If a trialing subscription which exists in order to downgrade to a lower tier
    // next period exists, then we need to delete it, because the user has decided
    // to switch back from lower to higher tier even before the lower tier was activated.
    if (nextPeriodLowerTierSubExists) {
      await stripe.subscriptions.cancel(trialingSub.id);
    }

    // When switching to a higher tier, we bill the user immediately
    updatedSubscription = await stripe.subscriptions.update(subToEdit.id, {
      items: [
        {
          id: subToEdit.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: "always_invoice",
      cancel_at_period_end: false,
    });
    
  } else {
    // Switching from higher tier to lower tier

    // if (subToEdit.schedule) {
    //   console.log("Releasing subscription from schedule:", subToEdit.schedule);
    //   await stripe.subscriptionSchedules.release(subToEdit.schedule as string);

    //   // Re-fetch the subscription to get the updated state without the schedule
    //   subToEdit = await stripe.subscriptions.retrieve(subToEdit.id);
    // }

    // When downgrading, we first change the higher tier subscription to end
    // after current period end
    updatedSubscription = await stripe.subscriptions.update(subToEdit.id, {
      cancel_at_period_end: true,
    });

    // Then we create a new subscription, which's trial will end on the current period end
    // effectively delaying the invoice
    if (!nextPeriodLowerTierSubExists) {
      const newSubscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: priceId,
          },
        ],
        trial_end: subToEdit.items.data[0].current_period_end,
      });
    }
  }

  return asNextResponseData({ subscription: updatedSubscription });
}
