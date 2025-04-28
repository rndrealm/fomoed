<script lang="ts">
	import { getContext } from 'svelte';
	import type { DashboardService } from '$ts/client/services/DashboardService.client';
	import { chart_page } from '$lib/stores';

	export let title = '';
	export let subtitle = '';

	let isOpen = false;

	const dashboardService = getContext<DashboardService>('dashboardService');

	const dropDownOptions = [
		{
			label: 'Crypto Fear and Greed',
			value: 0
		},
		{
			label: 'Simple CFgi',
			value: 1
		},
		{
			label: 'Liquidation Map',
			value: 2
		},
		{
			label: 'Liquidation Heatmap',
			value: 3
		},
		{
			label: 'Exchange Liquidation Map',
			value: 4
		}
	];
</script>

<div class="flex-grow">
	<button
		class="flex items-end justify-center flex-grow -desktop:pl-1 h-14"
		on:click={() => (isOpen = !isOpen)}
	>
		<div class="flex flex-col items-start">
			<div class=" text-[15px] -desktop:text-base uppercase font-semibold">
				{title}
			</div>

			<div class=" font-semibold text-[15px] text-[#737373] -desktop:text-xs">
				{subtitle}
			</div>
		</div>
		<img
			src="/icons/caret-up.svg"
			width={20}
			height={20}
			alt=""
			class="duration-100 ml-[7px] flex-shrink-0"
			class:rotate-180={!isOpen}
		/>
	</button>

	<div
		class:hidden={!isOpen}
		class="absolute top-22 -desktop:top-14 bg-[#090909] border-[#282828] border rounded-[10px] h-fit desktop:w-[240px] overflow-hidden flex flex-col z-[41] p-[6px]"
	>
		<div class="w-full overflow-x-hidden overflow-y-scroll no-scrollbar">
			{#each dropDownOptions || [] as item}
				<button
					on:click={() => {
						console.log('item', item);
						chart_page.set(item.value);
						dashboardService.setLastDisplayedChartIndex(item.value);
						isOpen = false;
					}}
					class="flex items-center gap-2 disabled:opacity-40 enabled:hover:bg-[#FFFFFF0D] hover:text-[#FFFFFFCC] w-full py-3 px-[15px] h-[37px] font-medium"
				>
					<p class="text-[13px] text-[#C3C3C3]">{item.label}</p>
				</button>
			{/each}
		</div>

		<div class="flex-grow"></div>
	</div>
</div>
