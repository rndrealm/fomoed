<script lang="ts">
	import { onMount } from 'svelte';
	import { prices_store } from '$lib/stores/stripe';
	import { loading } from '$lib/stores';
	import StripeProvider from '$lib/comps/StripeProvider.svelte';
	import PlansPage from '$lib/comps/PlansPage.svelte';

	onMount(() => {
		loading.set(true);

		fetch('/api/stripe/plans')
			.then((res) => res.json())
			.then((res) => {
				if (Array.isArray(res?.prices)) prices_store.set(res.prices);
			})
			.catch((err) => {
				console.error(err);

				// TODO Show users the error
			})
			.finally(() => loading.set(false));
	});

	$: console.log($prices_store);
</script>

<StripeProvider>
	<PlansPage />
</StripeProvider>
