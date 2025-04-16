import { derived, writable, type Readable } from 'svelte/store';
import { auth_user } from './user';
import type Stripe from 'stripe';

const ProPlanProductId = 'prod_QuL2KcFQNsFWb1';
const PlusPlanProductId = 'prod_Q4NT6y9VdwZlKo';

export const active_sub: Readable<Stripe.Subscription | null> = derived(auth_user, ($auth_user) => {
	if (!$auth_user) {
		return null;
	}

	const subs = $auth_user.subscriptions;

	// First try to find PRO sub, then try to find Plus sub
	const proSub = subs.find((i) => i.plan.product === ProPlanProductId);

	if (proSub) {
		return proSub;
	}

	const plusSub = subs.find((i) => i.plan.product === PlusPlanProductId);

	if (plusSub) {
		return plusSub;
	}

	return null;
});

export const changingSubscription = writable(false);

auth_user.subscribe(console.log);
