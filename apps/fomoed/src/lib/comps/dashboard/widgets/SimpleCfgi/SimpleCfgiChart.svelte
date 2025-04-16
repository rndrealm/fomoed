<script lang="ts">
	import { type ICoinCfgiPriceData } from '$lib';
	import {
		Chart,
		type ChartDataset,
		type CoreChartOptions,
		type DatasetChartOptions,
		type ElementChartOptions,
		type LineControllerChartOptions,
		type PluginChartOptions,
		type ScaleChartOptions
	} from 'chart.js';
	import type { _DeepPartialObject } from 'chart.js/dist/types/utils';
	import { coinstats_selected_coin } from '$lib/stores';
	import { logged_in } from '$lib/stores/user';
	import { fetchCfgi } from '$lib/comps/charts/chartUtils';
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';
	import { registerChartPluginZoomInBrowser } from '$ts/client/utils/ui';
	import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
	import type { ZoomPluginOptions } from 'chartjs-plugin-zoom/types/options';
	import { callback } from 'chart.js/helpers';
	import dayjs from 'dayjs';
	import { type CrosshairPluginConfig } from '$ts/client/charts/plugins/CrosshairPlugin';

	registerChartPluginZoomInBrowser();

	const fullscreenAnimCompleteCounterStore: Readable<boolean> = getContext(
		'fullscreenAnimCompleteCounterStore'
	);

	export let daysBack: number;
	export let loading = true;

	const color = '#47A663';

	export let chart: Chart;
	let ctx: CanvasRenderingContext2D;

	function updateGradient() {
		if (!ctx) {
			return;
		}

		const gradient = ctx.createLinearGradient(0, 0, 0, Math.round(container.clientHeight));

		gradient.addColorStop(0, 'rgba(71, 166, 99, 0.4)');
		gradient.addColorStop(1, 'rgba(71, 166, 99, 0)');

		chart.data.datasets[0].backgroundColor = gradient;
		chart.update();
	}

	async function chart_init(data: ICoinCfgiPriceData[]) {
		const formatted_data = data.filter((d) => d.cfgi);
		const cfgi_data = formatted_data.map((c) => c.cfgi);

		console.log({ formatted_data });

		if (chart) {
			chart.destroy();
		}

		const cfgiData: ChartDataset<'line'> = {
			type: 'line',
			data: cfgi_data,
			label: 'Fear and Greed Index',
			order: 1,
			fill: true,
			borderColor: color,
			borderWidth: 1,
			pointRadius: 0,
			xAxisID: 'x'
		};

		const labels = formatted_data.map((d) => d.date);

		const chart_data = {
			labels,
			datasets: [cfgiData]
		};

		const minDate = formatted_data[0].date;
		const maxDate = formatted_data[formatted_data.length - 1].date;

		const zoomPluginOptions: ZoomPluginOptions = {
			zoom: {
				wheel: {
					enabled: true
				},
				pinch: {
					enabled: true
				},
				mode: 'x',
				scaleMode: 'y'
			},
			pan: {
				enabled: true,
				mode: 'xy',
				threshold: 0
			},
			limits: {
				x: { minRange: 1000 * 60 * 60 * 24 * 1, min: minDate, max: maxDate },
				y: { min: 0 }
			}
		};

		const crosshairPluginOptions: CrosshairPluginConfig = {
			labels: [
				{
					scaleId: 'x',
					label: 'Date & Time',
					getText: () => (val) => {
						return dayjs(val).format('DD MMM YYYY');
					}
				},
				{
					scaleId: 'y',
					label: 'CFGI',
					getText: () => (val) => val.toFixed(0),
					getTextColor: () => (val) => 'white'
				}
			],
			crosshairEnableDelay: 200
		};

		const options: _DeepPartialObject<
			CoreChartOptions<'bar'> &
				ElementChartOptions<'bar'> &
				PluginChartOptions<'bar'> &
				DatasetChartOptions<'bar'> &
				ScaleChartOptions<'bar'> &
				LineControllerChartOptions
		> = {
			animation: {
				duration: 0
			},
			responsive: false,
			maintainAspectRatio: false,
			interaction: false,
			scales: {
				y: {
					beginAtZero: true,
					grid: {
						display: true,
						color: '#272525',
						offset: false
					},
					ticks: {
						display: true,
						callback: (val: any) => {
							return Math.round(val);
						}
					},
					border: {
						display: false
					},
					min: 0,
					max: 100,
					step: 20,
					color: '#FFFFFF'
				},
				x: {
					type: 'time',
					// beginAtZero: true,
					grid: {
						display: true,
						color: '#272525',
						offset: false
					},
					ticks: {
						maxRotation: 0,
						minRotation: 0
						// autoSkipPadding: 10
					},
					border: {
						display: false
					}
					// beforeFit: function (axis: any) {
					// 	var l = axis.getLabels();
					// 	axis.ticks.push({ value: axis.max, label: l[axis.max] });
					// }
				}
			},
			plugins: {
				legend: {
					display: false
				},
				tooltip: {
					enabled: false
				},
				zoom: zoomPluginOptions,
				crosshair: crosshairPluginOptions
			}
		};

		if (canvas) {
			chart = new Chart(canvas, {
				type: 'line',
				data: chart_data,
				options: options
			});

			updateGradient();

			chart.resize();
		}
	}

	async function refreshData() {
		loading = true;

		let data: ICoinCfgiPriceData[];

		try {
			data = await fetchCfgi(daysBack);
		} finally {
			loading = false;
		}

		// Component could already be unmounted
		if (!canvas) {
			return;
		}

		ctx = canvas.getContext('2d')!;
		chart_init(data);
	}

	$: if ($coinstats_selected_coin && daysBack && $logged_in !== null) {
		refreshData();
	}

	let container: HTMLElement;
	let canvas: HTMLCanvasElement;
	let containerClientHeight: number;

	$: $fullscreenAnimCompleteCounterStore && updateGradient();
</script>

<div bind:this={container} bind:clientHeight={containerClientHeight} class="relative h-full">
	<canvas bind:this={canvas}></canvas>
</div>
