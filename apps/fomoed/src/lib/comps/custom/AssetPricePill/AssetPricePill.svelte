<script lang="ts">
	import { getChangeTextColor } from '$ts/client/utils/ui';
	import { liveDataService } from '$ts/client/services/LiveSymbolDataService.client.svelte';
	import { onMount } from 'svelte';

	interface Props {
		symbol: string;
	}

	let { symbol = 'BTC' }: Props = $props();

	let symbolData = $state<{ price: number; change24h: number } | undefined>(undefined);

	// Format price for display
	let formattedPrice = $derived(
		symbolData?.price !== undefined
			? symbolData.price.toLocaleString('en-US', {
					style: 'currency',
					currency: 'USD',
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				})
			: '$0.00'
	);

	let textColor = $derived(
		symbolData?.change24h !== undefined ? getChangeTextColor(symbolData.change24h) : ''
	);

	function updateLiveData() {
		const data = liveDataService.liveSymbolData.get(symbol);
		if (data) {
			symbolData = {
				price: data.price,
				change24h: data.change24h
			};
		}
	}

	onMount(() => {
		// Initial update
		updateLiveData();

		// Set up interval to check for updates
		const interval = setInterval(() => {
			updateLiveData();
		}, 10000); // Check every 10 seconds

		return () => clearInterval(interval);
	});
</script>

<!-- Asset price pill -->
<div
	class="inline-flex items-center px-3 py-1.5 rounded-full bg-[#333333] text-white font-sans font-medium text-xs"
>
	<span class="text-[#A4A4A4]">{symbol}:</span>
	<span class="font-medium text-[#BBBBBB]">&nbsp;{formattedPrice}</span>
	<span class="mx-1.5 text-[#A6A6A6]">•</span>
	{#if symbolData?.change24h !== undefined}
		<span class="font-semibold" style="color: {textColor};">
			{symbolData.change24h >= 0 ? '+' : ''}{symbolData.change24h.toFixed(2)}%
		</span>
	{:else}
		<span class="font-medium text-[#BBBBBB]">--</span>
	{/if}
</div>
