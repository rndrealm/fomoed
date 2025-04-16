import type Stripe from 'stripe';
import { writable } from 'svelte/store';

export const prices_store = writable<(Stripe.Price & { name: string; features: string[] })[]>([]);
