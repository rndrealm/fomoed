<script lang="ts">
	import { Chart } from 'chart.js/auto';
	import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
	import annotationPlugin from 'chartjs-plugin-annotation';
	import type { LiqMapData } from '$lib/comps/charts/chartUtils';
	import { failure } from '$lib/utils';
	import { registerChartPluginZoomInBrowser } from '$ts/client/utils/ui';
	import type { ZoomPluginOptions } from 'chartjs-plugin-zoom/types/options';
	import { type CrosshairPluginConfig } from '$ts/client/charts/plugins/CrosshairPlugin';
	import dayjs from 'dayjs';
	import { commaFormatNumber } from '$ts/utils/client/charts';
	import { humanizeNumber } from '$ts/utils/client';

	Chart.register(annotationPlugin);
	registerChartPluginZoomInBrowser();

	export let chart: Chart;
	export let currentPrice: number = 0;
	export let data: LiqMapData | null;

	let canvas: HTMLCanvasElement;

	function reset() {
		if (!canvas) return;

		chart?.destroy();

		if (!data) {
			failure('No data.');
			return;
		}

		currentPrice = data.currentPrice;

		const ctx = canvas.getContext('2d');

		if (!ctx) {
			return;
		}

		const gradientLong = ctx.createLinearGradient(0, 0, 0, 400);
		gradientLong.addColorStop(0, '#22AB9422');
		gradientLong.addColorStop(1, '#22AB9400');

		const gradientShort = ctx.createLinearGradient(0, 0, 0, 400);
		gradientShort.addColorStop(0, '#FF3B1022');
		gradientShort.addColorStop(1, '#FF3B1000');

		if (chart) {
			chart.destroy();
		}

		const minPricePoint = data.minPrice;
		const maxPricePoint = data.maxPrice;
		const maxShownCumulativeValue = data.maxCumulativeValue * 1.15;

		const zoomPluginOptions: ZoomPluginOptions = {
			zoom: {
				wheel: {
					enabled: true,
					speed: 0.05
				},
				pinch: {
					enabled: true
				},
				mode: 'x'
				// scaleMode: 'y'
			},
			pan: {
				enabled: true,
				mode: 'x',
				threshold: 0
			},
			limits: {
				x: { minRange: 100, min: minPricePoint, max: maxPricePoint },
				y: { min: 0 },
				cumulative: { min: 0, max: maxShownCumulativeValue }
			}
		};

		const nf = Intl.NumberFormat('en-US');

		const crosshairPluginOptions: CrosshairPluginConfig = {
			labels: [
				{
					scaleId: 'x',
					label: 'Price',
					getText: () => (val) => {
						return '$' + commaFormatNumber(val);
					}
				},
				{
					scaleId: 'y',
					label: 'At price',
					getText: () => (val) => humanizeNumber(val),
					getTextColor: () => (val) => 'white'
				},
				{
					scaleId: 'cumulative',
					label: 'Cumulative',
					getText: () => (val) => humanizeNumber(val),
					getTextColor: () => (val) => 'white'
				}
			],
			crosshairEnableDelay: 200,
			labelStackDirection: 'vertical'
		};

		chart = new Chart(canvas, {
			data: {
				datasets: [
					{
						type: 'bar',
						data: data.liqBars,
						barThickness: 0.5,
						order: 20,
						backgroundColor: data.liqBars.map((i) => i.color),
						xAxisID: 'x',
						yAxisID: 'y'
					},
					{
						type: 'line',
						data: data.cumulativeLongLiqLeverage,
						borderColor: '#22AB94',
						spanGaps: true,
						pointRadius: 0,
						yAxisID: 'cumulative',
						borderWidth: 2,
						order: 10,
						backgroundColor: gradientLong,
						fill: true,
						xAxisID: 'x'
					},
					{
						type: 'line',
						data: data.cumulativeShortLiqLeverage,
						borderColor: '#FF3B10',
						spanGaps: true,
						pointRadius: 0,
						yAxisID: 'cumulative',
						borderWidth: 2,
						order: 10,
						backgroundColor: gradientShort,
						fill: true,
						xAxisID: 'x'
					}
				]
			},
			options: {
				spanGaps: true,
				animation: false,
				responsive: false,
				maintainAspectRatio: false,
				scales: {
					x: {
						type: 'linear',
						ticks: {
							callback: (val: any) => {
								return Math.round(val / 1000) + 'K';
							}
						},
						grid: {
							display: false
						},
						min: data.minPrice,
						max: data.maxPrice,
						offset: false
					},
					y: {
						type: 'linear',
						grid: {
							color: '#fff2'
						},
						border: {
							dash: [4, 2]
						},
						min: 0,
						ticks: {
							callback: (val: any) => `${Math.round(val / 1000000)}M`
						}
					},
					cumulative: {
						type: 'linear',
						grid: {
							color: '#fff2'
						},
						position: 'right',
						max: maxShownCumulativeValue,
						min: 0,
						border: {
							dash: [8, 4]
						},
						ticks: {
							callback: (val: any) => `${Math.round(val / 1000000)}M`
						}
					}
				},
				interaction: false,
				plugins: {
					crosshair: crosshairPluginOptions,
					legend: {
						display: false
					},
					// tooltip: {
					// 	position: 'nearest',
					// 	callbacks: {
					// 		title: (ctx: any) => {
					// 			const formatted = nf.format(ctx[0].parsed.x);

					// 			return `Price: ${formatted} USD`;
					// 		},
					// 		label: (ctx) => {
					// 			const formatted = nf.format(Math.round(ctx.parsed.y));

					// 			if (ctx.datasetIndex === 0) {
					// 				return ` Leverage: ${formatted}`;
					// 			} else if (ctx.datasetIndex === 1 || ctx.datasetIndex === 2) {
					// 				return ` Cumulative: ${formatted}`;
					// 			}
					// 		},
					// 		labelColor: (ctx: any) => {
					// 			const color = ctx.dataset.borderColor || ctx.raw.color;

					// 			return {
					// 				borderColor: color,
					// 				backgroundColor: color,
					// 				borderWidth: 2,
					// 				borderRadius: 2
					// 			};
					// 		}
					// 	}
					// },
					tooltip: {
						enabled: false
					},
					annotation: {
						annotations: {
							currentPriceLine: {
								type: 'line',
								yMin: 0,
								yMax: data.maxCumulativeValue * 1.15,
								yScaleID: 'cumulative',
								borderColor: 'red',
								borderWidth: 2,
								xMin: data.currentPrice,
								xMax: data.currentPrice,
								borderDash: [8, 4],
								arrowHeads: {
									end: {
										backgroundColor: 'red',
										display: true,
										fill: true,
										borderDash: [0, 0]
									}
								}
							}
						}
					},
					zoom: zoomPluginOptions
				}
			}
		});

		chart.resize();
	}

	$: data && reset();
</script>

<div class="relative w-full h-full">
	<canvas bind:this={canvas}></canvas>
</div>
