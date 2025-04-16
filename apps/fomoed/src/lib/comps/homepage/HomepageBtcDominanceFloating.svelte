<script lang="ts">
	import { coinstats_global_data } from '$lib/stores';

	import FloatingCard from '../FloatingCard.svelte';
	import HomepageSmallChart from '../HomepageSmallChart.svelte';
</script>

<FloatingCard>
	<div class="px-[22px]">
		<HomepageSmallChart
			title="BTC Dominance"
			value={$coinstats_global_data?.btcDominance.toLocaleString()}
			change={$coinstats_global_data?.btcDominanceChange}
			postfix="%"
			prefix=""
		></HomepageSmallChart>
	</div>
</FloatingCard>
