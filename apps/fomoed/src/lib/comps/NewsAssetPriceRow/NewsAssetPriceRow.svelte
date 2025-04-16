<script lang="ts">
	import {
		liveDataService,
		type LiveSymbolData
	} from '$ts/client/services/LiveSymbolDataService.client.svelte';
	import { type SymbolData, symbols } from '.';
	import { fade } from 'svelte/transition';

	const symbolDatas = $derived.by(() => {
		const filteredSymbols: LiveSymbolData[] = [];

		for (const symbol of symbols) {
			const data = liveDataService.liveSymbolData.get(symbol);

			if (data) {
				filteredSymbols.push(data);
			}
		}

		return filteredSymbols.map((data) => ({
			id: data.symbol,
			symbol: data.symbol,
			name: data.name,
			iconUrl: data.iconUrl,
			price: data.price,
			dayDelta: data.change24h
		}));
	});
</script>

<!-- Asset price row -->
<div class="flex overflow-x-auto gap-x-1 no-scrollbar h-[72px]">
	{#each symbolDatas as asset (asset.id)}
		{@render assetBlock(asset)}
	{/each}
</div>

{#snippet assetBlock(asset: SymbolData)}
	<!-- Asset block -->
	<div
		class="flex justify-between bg-[#1C1C1C] p-4 min-w-[240px] shadow-sm flex-1 font-inter"
		in:fade
	>
		<div class="flex gap-3">
			<!-- Asset icon -->
			<div class="flex-shrink-0">
				<img
					src={asset.iconUrl}
					alt=""
					class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 object-cover"
				/>
			</div>

			<!-- Symbol and name -->
			<div class="flex flex-col justify-center">
				<span class="font-semibold text-gray-900 dark:text-gray-100">{asset.symbol}</span>
				<span class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[80px]"
					>{asset.name}</span
				>
			</div>
		</div>

		<!-- Price and day delta -->
		<div class="flex flex-col items-end justify-center">
			<span class="font-bold text-gray-900 dark:text-gray-100">
				${typeof asset.price === 'number' ? asset.price.toFixed(2) : 'N/A'}
			</span>
			<span
				class="font-semibold {`text-xs font-medium ${typeof asset.dayDelta !== 'number' ? 'text-gray-500' : asset.dayDelta >= 0 ? 'text-[#1FC16B]' : 'text-[#FB3748]'}`}"
			>
				{#if typeof asset.dayDelta === 'number'}
					{asset.dayDelta >= 0 ? '+' : '-'}{Math.abs(asset.dayDelta).toFixed(2)}%
				{:else}
					--
				{/if}
			</span>
		</div>
	</div>
{/snippet}
