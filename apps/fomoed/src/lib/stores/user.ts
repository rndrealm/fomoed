import { writable } from 'svelte/store';
import type Stripe from 'stripe';

export const auth_user = writable<
	(IUser & { subscriptions: (Stripe.Subscription & { plan: Stripe.Plan })[] }) | null
>(null);
export const auth_email = writable<string | null>(null);
export const logged_in = writable<boolean | null>(null);
