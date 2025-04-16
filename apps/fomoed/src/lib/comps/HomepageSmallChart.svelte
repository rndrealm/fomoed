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
	export let hideChange = false;

	const chartData = getChartData();
	const color = '#FF3B10';

	onMount(() => {
		const ctx = canvas.getContext('2d');
		const chart = new Chart(ctx!, {
			type: 'line',
			data: data,
			options: options
		});
	});

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

	let canvas: HTMLCanvasElement;
</script>

<div class="flex items-center gap-x-2 w-full h-full snap-center -desktop:h-[100px]">
	<div>
		<div class="uppercase opacity-60 text-sm whitespace-nowrap">{title}</div>

		<div class="mt-[10px] text-lg font-paralucent font-medium">
			{prefix}{value}{postfix}
		</div>

		<div class="mt-[6px]" class:opacity-0={hideChange}>
			<ChangeBadge percentage={change} />
		</div>
	</div>

	<div class="w-[95px] h-[45px] flex-grow opacity-0">
		<canvas bind:this={canvas} width="400" height="150" />
	</div>
</div>
