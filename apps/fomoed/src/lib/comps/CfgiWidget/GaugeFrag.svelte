<script lang="ts">
	import { humanizeNumber } from '$ts/utils/client';
	import Gauge from './Gauge.svelte';

	let { symbol, gaugeValue, v24, price, dominance } = $props<{
		symbol?: string;
		gaugeValue?: number;
		v24?: number;
		price?: number;
		dominance?: number;
	}>();
</script>

{#snippet field(label, value)}
	<div class="bg-[#1C1C1C] rounded-lg flex py-2 px-4 text-sm whitespace-nowrap gap-x-2">
		<div class="text-[#A6A6A6] flex-grow font-medium truncate">{label}</div>

		{#if value !== undefined}
			<div class="font-semibold text-white">{value}</div>
		{:else}
			<!-- Skeleton loader for field value -->
			<div class="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
		{/if}
	</div>
{/snippet}

<div class="border-[0.5px] border-[#333333] h-[160px] rounded-[20px] overflow-hidden">
	<div class="flex h-full px-3 place-items-center gap-x-4">
		<div class="w-[240px] flex-shrink-0 h-full pb-2">
			{#if gaugeValue !== undefined}
				<Gauge value={gaugeValue} />
			{:else}
				<!-- Skeleton loader for gauge -->
				<div class="flex items-center justify-center w-full h-full">
					<div class="w-32 h-32 bg-gray-700 rounded-full animate-pulse"></div>
				</div>
			{/if}
		</div>

		<div class="grid w-full gap-y-2">
			{@render field('24h Volume', v24 ? humanizeNumber(v24) : undefined)}
			{@render field((symbol ?? 'Token') + ' Price', price ? '$' + price.toFixed(2) : undefined)}
			{@render field((symbol ?? 'Token') + ' Dominance', dominance)}
		</div>
	</div>
</div>
