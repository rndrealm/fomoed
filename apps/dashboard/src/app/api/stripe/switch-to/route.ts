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
    // Switching from higher tier to lower tier using a Subscription Schedule

    // Find the subscription's current schedule, or create one if it doesn't exist
    // Fix 1: Check if subscription already has a schedule
    let schedule: Stripe.SubscriptionSchedule | null = null;
    
    if (subToEdit.schedule) {
      // If the subscription has a schedule ID, retrieve it
      schedule = await stripe.subscriptionSchedules.retrieve(subToEdit.schedule as string);
    }

    if (!schedule) {
      schedule = await stripe.subscriptionSchedules.create({
        from_subscription: subToEdit.id,
      });
    }

    // Get the current and next phases of the schedule
    const currentPhase = schedule.phases[0];
    const nextPhase = schedule.phases.length > 1 ? schedule.phases[1] : null;

    // Fix 2: Transform the current phase items to match the expected type
    const transformedCurrentPhaseItems: Stripe.SubscriptionScheduleUpdateParams.Phase.Item[] = 
      currentPhase.items.map(item => ({
        price: typeof item.price === 'string' ? item.price : item.price.id,
        quantity: item.quantity,
        ...(item.tax_rates && { 
          tax_rates: item.tax_rates.map(rate => typeof rate === 'string' ? rate : rate.id)
        }),
        ...(item.billing_thresholds && item.billing_thresholds.usage_gte !== null && {
          billing_thresholds: {
            usage_gte: item.billing_thresholds.usage_gte
          }
        })
      }));

    // Update the schedule to change the plan at the end of the current period
    await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: "release",
      phases: [
        {
          // This is the current phase; it remains unchanged
          items: transformedCurrentPhaseItems,
          start_date: currentPhase.start_date,
          end_date: currentPhase.end_date,
        },
        {
          // This is the new, downgraded phase that starts after the current one ends
          items: [{ price: priceId }],
          start_date: currentPhase.end_date,
        },
      ],
    });

    // The 'updatedSubscription' is still the original subscription.
    // Its future downgrade is now scheduled.
    updatedSubscription = subToEdit;
  }
  return asNextResponseData({ subscription: updatedSubscription });
}