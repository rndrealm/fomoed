<script lang="ts">
	import StripeProvider from '$lib/comps/StripeProvider.svelte';
	import PlansPage from '$lib/comps/PlansPage.svelte';
</script>

<StripeProvider>
	<PlansPage />
</StripeProvider>
