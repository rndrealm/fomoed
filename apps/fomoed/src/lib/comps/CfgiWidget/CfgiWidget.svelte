<script lang="ts">
	import CfgiIcon from '$lib/icons/CfgiIcon.svelte';
	import { cfgiDataService } from '$ts/client/services/CfgiDataService.client.svelte';
	import { liveDataService } from '$ts/client/services/LiveSymbolDataService.client.svelte';
	import IndicatorCard from '../IndicatorCard.svelte';
	import CfgiAssetDropdown from './CfgiAssetDropdown.svelte';
	import GaugeFrag from './GaugeFrag.svelte';

	let { symbol } = $props<{ symbol?: string }>();

	let selectedSymbol = $state(symbol || 'BTC');

	$inspect(selectedSymbol, 'selectedSymbol');

	$effect(() => {
		if (selectedSymbol) {
			cfgiDataService.fetchCfgiData(selectedSymbol);
		}
	});

	let lastCfgiData = $derived.by(() => {
		const datapoints = cfgiDataService.cfgiData.get(selectedSymbol);
		const lastDataPoint = datapoints?.[datapoints.length - 1];

		return lastDataPoint;
	});

	// Get live data for the selected symbol
	let liveSymbolData = $derived.by(() => {
		return liveDataService.liveSymbolData.get(selectedSymbol);
	});

	// Calculate symbol dominance
	let symbolDominance = $derived.by(() => {
		// For BTC, use the btcDominance value directly
		if (selectedSymbol === 'BTC' && liveDataService.globalMarketData) {
			return liveDataService.globalMarketData.btcDominance;
		}

		// For other coins, we need to get global data from the service
		if (!liveDataService.globalMarketData || !liveSymbolData) {
			return null;
		}

		// Calculate the approximate market cap of the coin
		// (price * circulating supply would be ideal, but we don't have supply data)
		// For now, we can use volume as a proxy for relative market importance
		const globalVolume = liveDataService.globalMarketData.volume;
		if (globalVolume <= 0 || !liveSymbolData.volume24h) {
			return null;
		}

		// Calculate volume-based dominance as an approximation
		// This isn't accurate market cap dominance, but gives a relative indication
		return (liveSymbolData.volume24h / globalVolume) * 100;
	});
</script>

<div
	class=" max-w-lg mx-auto border-[0.5px] border-[#1E1E1E] py-[30px] px-[27px] bg-[#070707] rounded-[20px] w-full"
>
	<!-- Header Section -->
	<div class="flex items-center justify-between">
		<div class="flex items-center pl-2 gap-x-2">
			<div class="size-5">
				<CfgiIcon />
			</div>

			<h2 class="text-xl font-medium whitespace-nowrap">Fear and Greed Index</h2>
		</div>

		<CfgiAssetDropdown bind:value={selectedSymbol} />
	</div>

	<!-- Gauge Section -->
	<div class="pt-3">
		<!-- <GaugeFrag
			gaugeValue={lastCfgiData?.cfgi || null}
			symbol={selectedSymbol}
			price={liveSymbolData?.price}
			v24={liveSymbolData?.volume24h}
			dominance={symbolDominance !== null ? symbolDominance.toFixed(2) : null}
		/> -->
		<!-- <IndicatorCard /> -->
	</div>
</div>

<style>
	.innerShadow {
		box-shadow: 0px 0px 16px 1px #ffffff14 inset;
	}
</style>
