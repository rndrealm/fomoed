<script lang="ts">
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { GaugeController } from 'chartjs-gauge-v3';
	import { Chart } from 'chart.js/auto';
	import Time from 'svelte-time';
	import { get_data_color, get_data_label } from '$lib/utils';
	import {
		cfgi_summary,
		coinstats_selected_coin,
		cfgi_chart_loading,
		cfgi_period
	} from '$lib/stores';
	import Loader from '$lib/comps/Loader.svelte';
	import { CfgiPeriods } from '$lib/utils/cfgi_data';

	export let for_screenshot = false;
	export let image = '';

	let cfgi_chart_canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let cfgi_cfgi_chart: Chart;

	let cfgi_period_label: string;

	type TData = {
		average: number;
		now: number;
		previous: number;
		last_updated: number;
	};

	const data = writable<TData>();

	function chart_init() {
		if (!$data || !cfgi_chart_canvas) {
			return;
		}

		cfgi_chart_loading.set(false);

		if (cfgi_cfgi_chart) {
			cfgi_cfgi_chart.destroy();
		}

		const chart_data = {
			labels: ['Extreme Fear', 'Fear', 'Greed', 'Extreme Greed'],
			datasets: [
				{
					data: [25, 50, 75, 100],
					value: $data?.now,
					backgroundColor: [
						get_data_color(25),
						get_data_color(50),
						get_data_color(75),
						get_data_color(100)
					],
					borderWidth: 8,
					borderColor: '#0d0d0d'
				}
			]
		};

		const options = {
			responsive: true,
			maintainAspectRatio: false,
			needle: {
				color: '#262626'
			},
			valueLabel: {
				formatter: Math.round,
				display: false
			}
		};

		if (cfgi_chart_canvas) {
			cfgi_cfgi_chart = new Chart(cfgi_chart_canvas, {
				type: 'gauge',
				data: chart_data,
				options: options
			});
		}
	}

	onMount(() => {
		Chart.register(GaugeController);
		ctx = cfgi_chart_canvas.getContext('2d');
		chart_init();
	});

	data.subscribe((d) => {
		if (d) {
			chart_init();
		}
	});

	cfgi_summary.subscribe((summary) => {
		if (summary) {
			data.set({
				now: summary.now.value,
				average: summary.average.value,
				previous: summary.previous.value,
				last_updated: summary.now.timestamp
			});
		}
	});

	cfgi_period.subscribe((period) => {
		const p = CfgiPeriods.find((p) => p.value === period);
		if (p) {
			cfgi_period_label = p.label;
		}
	});
</script>

<div
	class="gauge_chart_widget bg-background rounded-xl flex flex-col items-center justify-between p-6 mx-auto {for_screenshot &&
	$$props.class
		? $$props.class
		: 'max-w-[90%] sm:max-w-[600px] h-[500px] sm:h-[300px]'}"
>
	<div class="flex flex-col justify-between w-full sm:items-center sm:flex-row chart_widget_title">
		<div class="{for_screenshot ? 'text-2xl' : 'text-lg'} font-bold text-white title">
			Crypto Fear and Greed Indicator
		</div>
		{#if $data}
			<div
				class="{for_screenshot ? 'text-sm' : 'text-xs'} text-white last_update_date text-opacity-30"
			>
				Last Updated: <Time timestamp={new Date($data?.last_updated)} format="MMMM DD, YYYY" />
			</div>
		{/if}
	</div>

	<div class="relative flex flex-col items-center justify-between w-full sm:flex-row chart_wrapper">
		<div class="relative flex flex-col w-full sm:w-2/3 chart_details">
			<div
				class="cfgi_chart_wrapper w-full px-5 relative {for_screenshot
					? 'sm:w-[780px] h-[530px]'
					: 'sm:w-[330px] h-[260px]'}"
			>
				{#if $cfgi_chart_loading}
					<Loader />
				{/if}
				<canvas
					class:opacity-0={$cfgi_chart_loading || !$data}
					id="cfgi_chart"
					bind:this={cfgi_chart_canvas}
				></canvas>
				{#if for_screenshot ? image : $coinstats_selected_coin && !$cfgi_chart_loading && $data}
					{#if for_screenshot && image}
						<img src={image} class="absolute -translate-x-1/2 left-1/2 bottom-[16%]" alt="" />
					{:else}
						<div
							class="absolute bottom-[36%] sm:bottom-[32%] w-[8%] h-[8%] rounded-full left-1/2 -translate-x-1/2 bg-center bg-cover bg-no-repeat overflow-hidden token_logo"
							style="background-image: url('{for_screenshot
								? image
								: $coinstats_selected_coin?.icon}')"
						/>
					{/if}
				{/if}
			</div>
			{#if $data}
				<div
					class="absolute flex space-x-2 -translate-x-1/2 left-1/2 data_value {for_screenshot
						? 'top-[92%] text-base'
						: 'top-[78%] text-xs'}"
					class:hidden={$cfgi_chart_loading || !$data}
				>
					<div class="text-white value_title text-opacity-30">Now:</div>
					<div class="font-bold value" style="color: {get_data_color($data?.now)}">
						{$data?.now}
						{get_data_label($data?.now)}
					</div>
				</div>
			{/if}
		</div>

		<div
			class="flex flex-col items-start w-full space-y-2 sm:h-4/6 sentiment justify-evenly sm:pl-10 sm:-mt-10"
			class:hidden={$cfgi_chart_loading || !$data}
		>
			<div
				class="flex items-center justify-center font-extrabold sentiment_title whitespace-nowrap"
			>
				Market Sentiment <span
					class="inline-block pt-[0.1rem] pl-2 {for_screenshot ? 'text-sm' : 'text-xs'}"
					style="color: {get_data_color($data?.now)}"
				>
					{cfgi_period_label ? `(${cfgi_period_label})` : ''}
				</span>
			</div>
			{#key $data}
				{#if $data}
					<div class="data_item">
						<div
							class="{for_screenshot
								? 'text-base'
								: 'text-xs'} text-white value_title text-opacity-30"
						>
							Now
						</div>
						<div
							class="{for_screenshot ? 'text-lg' : 'text-sm'} font-bold now"
							style="color: {get_data_color($data?.now)}"
						>
							{$data?.now}
							{get_data_label($data?.now)}
						</div>
					</div>
					<div class="data_item">
						<div
							class="{for_screenshot
								? 'text-base'
								: 'text-xs'} text-white value_title text-opacity-30"
						>
							Previous
						</div>
						<div
							class="{for_screenshot ? 'text-lg' : 'text-sm'} font-bold yesterday"
							style="color: {get_data_color($data?.previous)}"
						>
							{$data?.previous}
							{get_data_label($data?.previous)}
						</div>
					</div>
					<div class="data_item">
						<div
							class="{for_screenshot
								? 'text-base'
								: 'text-xs'} text-white value_title text-opacity-30"
						>
							Average
						</div>
						<div
							class="{for_screenshot ? 'text-lg' : 'text-sm'} font-bold last_week"
							style="color: {get_data_color($data?.average)}"
						>
							{$data?.average} Extreme {get_data_label($data?.average)}
						</div>
					</div>
				{/if}
			{/key}
		</div>
	</div>
</div>
