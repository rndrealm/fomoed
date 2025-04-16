import type { Stripe } from '@stripe/stripe-js';
import { writable } from 'svelte/store';

export const stripeStore = writable<Stripe | null>(null);
