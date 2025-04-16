<script lang="ts">
	import { onMount } from 'svelte';
	import type {
		ChartDataset,
		CoreChartOptions,
		DatasetChartOptions,
		ElementChartOptions,
		LineControllerChartOptions,
		PluginChartOptions,
		ScaleChartOptions
	} from 'chart.js/auto';
	import { Chart } from 'chart.js/auto';
	import { dayjs } from 'svelte-time';
	// @ts-expect-error
	import type { _DeepPartialObject } from 'chart.js/dist/types/utils';
	import { get_data_color } from '$lib/utils';
	import {
		cfgi_period,
		coin_data,
		coinstats_coin_list,
		coinstats_selected_coin,
		free_tokens,
		trend_chart_loading
	} from '$lib/stores';
	import Dropdown from '$lib/comps/Dropdown.svelte';
	import { auth_user } from '$lib/stores/user';
	import Loader from '$lib/comps/Loader.svelte';
	import { CfgiPeriods, cfgi_supported_tokens } from '$lib/utils/cfgi_data';

	let trend_chart_canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let cfgi_trend_chart: Chart;

	function chart_init() {
		if (!$coin_data?.length || !trend_chart_canvas) {
			return;
		}

		const formatted_data = $coin_data.filter((d) => d.price && d.cfgi);

		const prices_data = formatted_data.map((d) => d.price);
		const cfgi_data = formatted_data.map((c) => c.cfgi);

		if (cfgi_trend_chart) {
			cfgi_trend_chart.destroy();
		}

		const chart_bar_data: ChartDataset<'bar'> = {
			type: 'bar',
			data: cfgi_data,
			backgroundColor: cfgi_data.map((c) => (c ? get_data_color(c) : '#0d0d0d')),
			yAxisID: 'right-y-axis',
			label: 'Fear and Greed Index',
			order: 1
		};

		const chart_line_data: ChartDataset<'line'> = {
			type: 'line',
			data: prices_data,
			backgroundColor: '#2c56ff',
			yAxisID: 'left-y-axis',
			label: 'Price',
			order: 2,
			spanGaps: true,
			tension: 0.4,
			pointRadius: 0,
			borderColor: '#2c56ff'
		};

		const chart_data = {
			labels: formatted_data.map((d) => dayjs(d.date).format('DD MMM YYYY')),
			datasets: [chart_bar_data, chart_line_data]
		};

		const max_price = Math.max(...(prices_data.filter((d) => d) as number[]));
		const max_y_index = +`${+max_price.toString()[0] + 1}${max_price.toString().slice(1)}`;

		const options: _DeepPartialObject<
			CoreChartOptions<'bar'> &
				ElementChartOptions<'bar'> &
				PluginChartOptions<'bar'> &
				DatasetChartOptions<'bar'> &
				ScaleChartOptions<'bar'> &
				LineControllerChartOptions
		> = {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				'left-y-axis': {
					beginAtZero: false,
					ticks: {
						font: { family: 'Inter', size: 10 },
						callback: (value: number) => {
							return `$${value}`;
						}
					},
					min: Math.floor(Math.min(...(prices_data.filter((d) => d) as number[]))),
					max: Math.ceil(max_y_index),
					position: 'left'
				},
				'right-y-axis': {
					beginAtZero: true,
					grid: {
						display: true,
						drawOnChartArea: true,
						color: function (value: any, data: any) {
							return value.tick.value === 0
								? 'rgba(255, 255, 255, 0.3)'
								: get_data_color(value.tick.value);
						},
						lineWidth: 0.1,
						drawTicks: true
					},
					ticks: {
						font: { family: 'Inter', size: 10 },
						stepSize: 25,
						color: function (value: any, data: any) {
							return value.tick.value === 0
								? 'rgba(255, 255, 255, 0.3)'
								: get_data_color(value.tick.value);
						}
					},
					max: 100,
					position: 'right'
				},
				x: {
					ticks: {
						font: { family: 'Inter', size: 8 },
						autoSkip: true,
						maxRotation: 0,
						color: '#aaa'
					}
				}
			},
			plugins: {
				legend: {
					display: false
				}
			}
		};

		if (trend_chart_canvas) {
			cfgi_trend_chart = new Chart(trend_chart_canvas, {
				type: 'bar',
				// @ts-expect-error
				data: chart_data,
				options: options
			});
		}
	}

	onMount(() => {
		ctx = trend_chart_canvas.getContext('2d');
		chart_init();
	});

	coin_data.subscribe((coin_cfgi) => {
		if (coin_cfgi?.length) {
			chart_init();
		}
	});
</script>

<div class="px-3 py-5 sm:px-5 wrapper bg-background rounded-xl">
	<div class="flex flex-col justify-between w-full sm:items-center sm:flex-row chart_widget_title">
		<div class="pb-4 text-lg font-bold text-white title sm:pb-0">Crypto Fear and Greed Chart</div>
		{#if cfgi_supported_tokens.includes($coinstats_selected_coin?.symbol)}
			<div
				class="flex items-center pb-5 space-x-5 justify-evenly sm:pb-0 sm:justify-center sm:pr-10 sm:ml-auto periods_selector"
			>
				{#each CfgiPeriods as period}
					<button
						class="h-10 text-white bg-black rounded w-14"
						class:bg-green-700={$cfgi_period === period.value}
						class:text-opacity-80={$cfgi_period === period.value}
						class:text-opacity-40={$cfgi_period !== period.value}
						on:click={() => cfgi_period.set(period.value)}
					>
						{period.label}
					</button>
				{/each}
			</div>
		{/if}
		{#if $coinstats_coin_list?.length}
			<Dropdown
				class="ml-auto"
				items={$coinstats_coin_list}
				active_items={$auth_user && $auth_user?.has_valid_sub
					? $coinstats_coin_list.map((t) => t.symbol)
					: free_tokens}
				active_field="symbol"
				bind:selected_item={$coinstats_selected_coin}
				logo_field="icon"
				name_field="name"
				undefined_selected_item="Select Coin"
				search_fields={['name', 'symbol']}
			/>
		{/if}
	</div>
	<div class="trend_chart w-full px-0 sm:px-5 h-[360px] mx-auto py-10">
		{#if $trend_chart_loading}
			<Loader />
		{/if}
		<canvas class:opacity-0={$trend_chart_loading} id="trend_chart" bind:this={trend_chart_canvas}
		></canvas>
	</div>
</div>
