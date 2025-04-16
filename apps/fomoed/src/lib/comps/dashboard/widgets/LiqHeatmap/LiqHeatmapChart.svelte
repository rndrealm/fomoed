<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart } from 'chart.js/auto';
	import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
	import { evaluate_cmap } from '$ts/utils/client/colormap';
	import { formatRgb } from '$ts/utils/client/colors';
	import { fetchHeatmapData } from '$lib/comps/charts/chartUtils';
	import { registerChartPluginZoomInBrowser } from '$ts/client/utils/ui';
	import type { ZoomPluginOptions } from 'chartjs-plugin-zoom/types/options';
	import Dayjs from 'dayjs';
	import { LiqHeatmapController } from '$ts/client/charts/LiqHeatmapController';
	import { minBy } from 'lodash-es';
	import { humanizeNumber } from '$ts/utils/client';

	registerChartPluginZoomInBrowser();

	Chart.register(LiqHeatmapController);

	export let timeframe: string | undefined;
	export let exchange: string | undefined;
	export let symbol: string | undefined;
	export let maxLiqValue = 0;
	export let loading = false;
	export let error = false;
	export let chart: Chart | null = null;

	export async function refreshData() {
		if (!timeframe || !exchange || !symbol) {
			console.error('Attempted to refresh data without all required parameters', {
				timeframe,
				exchange,
				symbol
			});
			return;
		}

		loading = true;
		error = false;

		if (chart) {
			chart.destroy();
		}

		const data = await fetchHeatmapData(timeframe, exchange, symbol);

		if (!data) {
			error = true;
			loading = false;
			return;
		}

		const y = data.y;
		const prices = data.prices;
		const liq = data.liq;

		const liq_values = liq.map((i: any) => i[2]);
		const max_liq = Math.max(...liq_values);

		maxLiqValue = max_liq;

		const liqHeatmapData = liq.map((item: any) => {
			const normalized = item[2] / max_liq;
			const [r, g, b] = evaluate_cmap(normalized, 'viridis');
			const backgroundColor = formatRgb(r, g, b);

			return {
				x: prices[item[0]][0] * 1000,
				y: y[item[1]],
				backgroundColor
			};
		});

		for (let i = 1; i < y.length; i++) {
			const yVal = y[i];
			const prevYVal = y[i - 1];

			const pointsWithYVal = liqHeatmapData.filter((i) => i.y == yVal);

			for (const p of pointsWithYVal) {
				p.prevYVal = prevYVal;
			}
		}

		const datasets = [
			{
				type: 'candlestick',
				data: prices.map(function (item: any) {
					return {
						x: item[0] * 1000,
						o: item[1],
						h: item[2],
						l: item[3],
						c: item[4]
					};
				}),
				borderColors: {
					up: 'rgb(26, 152, 129)',
					down: 'rgb(239, 57, 74)',
					unchanged: '#999'
				},
				backgroundColors: {
					up: 'rgb(26, 152, 129)',
					down: 'rgb(239, 57, 74)',
					unchanged: '#999'
				},
				// order: 10,
				yAxisID: 'y',
				xAxisID: 'x',
				parsing: false,
				barPercentage: 0.5,
				categoryPercentage: 1
			},
			{
				type: 'liqHeatmap',
				data: liqHeatmapData,
				yAxisID: 'y',
				xAxisID: 'x',
				parsing: false
			}
		];

		const minTimestampSeconds = prices[0][0] * 1000;
		const maxTimestampSeconds = prices[prices.length - 1][0] * 1000;
		const minPrice = Math.min(...y);
		const maxPrice = Math.max(...y);

		const zoomPluginOptions: ZoomPluginOptions = {
			zoom: {
				wheel: {
					enabled: true,
					speed: 0.05
				},
				pinch: {
					enabled: true
				},
				mode: 'xy'
			},
			pan: {
				enabled: true,
				mode: 'xy',
				threshold: 0
			},
			limits: {
				x: { minRange: 1000 * 60 * 60 * 4, min: minTimestampSeconds, max: maxTimestampSeconds },
				y: { minRange: 1000, min: minPrice, max: maxPrice }
			}
		};

		chart = new Chart(canvas, {
			data: { datasets },
			layout: { padding: 0 },
			options: {
				animation: false,
				responsive: false,
				maintainAspectRatio: false,
				scales: {
					x: {
						type: 'time',
						offset: true
					},
					y: {
						position: 'right',
						type: 'linear',
						grid: {
							display: false
						},
						ticks: {
							callback: (value: number) => {
								if (value < 0) {
									return '';
								}

								return `$${Math.round(value / 1000)}k`;
							}
						}
					}
				},
				interaction: {
					mode: 'nearest',
					intersect: false
				},
				plugins: {
					legend: {
						display: false
					},
					zoom: zoomPluginOptions
				}
			},
			plugins: [
				{
					id: 'bg',
					beforeDraw: (chart: Chart) => {
						// Purple background
						const { ctx, chartArea } = chart;
						const { left, right, top, bottom } = chartArea;

						const gradient = ctx.createLinearGradient(0, top, 0, bottom);
						gradient.addColorStop(0, '#46035c');
						gradient.addColorStop(1, '#46035c');

						ctx.save();

						ctx.fillStyle = gradient;
						ctx.fillRect(left, top, right - left, bottom - top);

						ctx.restore();
					}
				}
			]
		});

		chart.resize();

		loading = false;
	}

	onMount(async () => {
		const { CandlestickController, CandlestickElement } = await import('chartjs-chart-financial');
		Chart.register(CandlestickElement, CandlestickController);
	});

	let canvas: HTMLCanvasElement;

	$: humanizedMaxLiqValue = humanizeNumber(maxLiqValue);
</script>

<div class="relative h-full pl-6">
	<div
		class:opacity-0={!humanizedMaxLiqValue}
		class="pl-2 flex flex-col text-[#FFFFFF66] font-paralucent font-medium text-xs gap-y-[5px] duration-500 absolute -top-3 bottom-2 left-0"
	>
		<div class="whitespace-nowrap">{humanizedMaxLiqValue}</div>

		<div
			class="rounded flex-grow w-2"
			style="background: linear-gradient(180deg, #E7E60B 0%, #63C752 22.5%, #27A77D 47%, #2F5C86 75%, #44095F 100%);"
		></div>

		<div>0</div>
	</div>

	<canvas class="!pl-0" class:opacity-0={loading || error} bind:this={canvas}></canvas>
</div>

<style>
	canvas {
		background-size: auto auto;
		background-repeat: no-repeat;
		background-position: 50px -30px;
	}
</style>
