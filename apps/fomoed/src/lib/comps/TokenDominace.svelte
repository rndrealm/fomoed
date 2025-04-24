<script lang="ts">
	import { getChartData } from '$lib/utils/mockChartData';
	import { onMount } from 'svelte';
	import ChangeBadge from './ChangeBadge.svelte';
	import { Chart } from 'chart.js/auto';

	export let title = 'Title';
	export let prefix = '';
	export let postfix = '';
	export let value = '0';
	export let change = 0;
	export let titleLabel = '';
	// export let hideChange = false;

	const chartData = getChartData();
	const color = '#FF3B10';

	const data = {
		labels: chartData.labels,
		datasets: [
			{
				label: 'Value',
				data: chartData.data,
				borderColor: color,
				borderWidth: 2,
				pointRadius: 0,
				// tension: 0.5,
				// fill: true,
				backgroundColor: color
			}
		]
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			y: {
				beginAtZero: true,
				grid: {
					display: false // Remove background grid
				},
				ticks: {
					display: false // Remove labels on the left
				},
				border: {
					display: false
				}
			},
			x: {
				beginAtZero: true,
				grid: {
					display: false // Remove background grid
				},
				ticks: {
					display: false
				},
				border: {
					display: false
				}
			}
		},
		plugins: {
			legend: {
				display: false
			},
			tooltip: {
				enabled: false
			}
		}
	};
</script>

<div
	class="flex w-full h-full snap-center py-4 px-5 bg-[#080808] rounded-2xl border border-[#141414]"
>
	<div class="flex flex-1 items-center justify-between">
		<div class="whitespace-nowrap flex items-center gap-2">
			<p class="text-[15px] text-[#737373] leading-[1.35] font-normal uppercase">{title}</p>
			<p class="text-[15px] text-white leading-[1.35] font-semibold uppercase">{titleLabel}</p>
		</div>

		<div class="flex items-center gap-2">
			<div class="text-[15px] text-white font-semibold">
				{prefix}{value}{postfix}
			</div>

			<div class="flex">
				{#if change !== 0}
					<div
						class="bg-[#1FC16B] rounded-md p-1 flex gap-1 items-center
        {change > 0 ? 'bg-[#1FC16B]' : 'bg-[#DA0000]'}"
					>
						<img src="/icons/arrow-up.svg" alt="icon" class:rotate-180={change < 0} />
						<p class="text-[#000] text-xs font-bold">{change}%</p>
					</div>
				{/if}
				<!-- <ChangeBadge percentage={change} /> -->
			</div>
		</div>
	</div>
</div>
