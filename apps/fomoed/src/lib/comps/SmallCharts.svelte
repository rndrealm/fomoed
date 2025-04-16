<script lang="ts">
	import { coinstats_global_data, coinstats_selected_coin } from '$lib/stores';

	import HomepageSmallChart from './HomepageSmallChart.svelte';
	import ScrollerDots from './ScrollerDots.svelte';

	let container: HTMLElement;

	// $: console.log($coinstats_global_data);
</script>

<div class="relative">
	<div
		bind:this={container}
		class="-desktop:pl-16 grid grid-cols-4 pl-[50px] pr-[80px] gap-x-16 -desktop:grid-cols-1 -desktop:h-[100px] -desktop:overflow-scroll -desktop:snap-y -desktop:snap-mandatory no-scrollbar"
	>
		<HomepageSmallChart
			change={$coinstats_global_data?.marketCapChange}
			value={$coinstats_selected_coin?.marketCap.toLocaleString()}
			title="{$coinstats_selected_coin?.symbol} Market Cap"
			prefix="$"
			postfix=""
			hideChange
		/>
		<HomepageSmallChart
			value={$coinstats_selected_coin?.volume.toLocaleString()}
			title="{$coinstats_selected_coin?.symbol} Volume 24H"
			prefix="$"
			postfix=""
			hideChange
		/>
		<HomepageSmallChart
			change={$coinstats_global_data?.btcDominanceChange}
			value={$coinstats_global_data?.btcDominance.toLocaleString()}
			title="BTC Dominance"
			prefix=""
			postfix="%"
		/>
		<HomepageSmallChart
			change={$coinstats_selected_coin?.priceChange}
			value={$coinstats_selected_coin?.price.toLocaleString()}
			title="{$coinstats_selected_coin?.symbol} Price"
			prefix="$"
			postfix=""
		/>

		<div class="absolute left-[18px] inset-y-0 desktop:hidden flex items-center">
			<ScrollerDots pages={4} vertical {container} />
		</div>
	</div>
</div>
