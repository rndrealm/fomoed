<script lang="ts">
	import { PUBLIC_STRIPE_PUBLIC_KEY } from '$env/static/public';
	import { stripeStore } from '$ts/utils/client/stripe';
	import { loadStripe, type Stripe } from '@stripe/stripe-js';
	import { onMount, setContext } from 'svelte';

	let stripe: Stripe | null;

	setContext('stripe', {
		getStripe: () => stripe
	});

	onMount(async () => {
		stripe = await loadStripe(PUBLIC_STRIPE_PUBLIC_KEY);

		stripeStore.set(stripe);
	});
</script>

{#if stripe}
	<slot />
{/if}
