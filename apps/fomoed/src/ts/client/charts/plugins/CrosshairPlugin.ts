import { Chart, type ChartEvent, type Plugin } from 'chart.js';

interface LabelingOptions {
	scaleId: string;
	label: string;
	widthComputeString?: string;

	// Chart JS somehow automatically calls the function when the plugin option is a function,
	// That is why these are functions returning functions.

	getTextColor?: () => (val: any) => string;
	getText: () => (val: number) => string;
}

export interface CrosshairPluginConfig {
	labels: LabelingOptions[];
	crosshairEnableDelay?: number;
	labelStackDirection: 'horizontal' | 'vertical';
}

type InputInterface = 'mouse' | 'touch';

interface CrosshairCache {
	enabledByTouch: boolean;
	datasetCache: any[];
	opts: CrosshairPluginConfig;
	coords: {
		x: number;
		y: number;
	} | null;
	lastToucheventCoords: {
		x: number;
		y: number;
	};
	totalLastTouchSeqDelta: {
		x: number;
		y: number;
	};
	crosshairEnabledInLastTouchSeq: boolean;
	lastUsedInputInterface: InputInterface;
	customEventHandlers: { event: string; handler: any }[];
}

type Chart_ = Chart & { _crosshairCache: CrosshairCache };

function interpretOpts(opts: LabelingOptions, val: number): { text: string; color: string } {
	return {
		text: (opts.getText as any)(val) as unknown as string,
		color: (opts.getTextColor as any)?.(val) ?? 'white'
	};
}

function renderXCrosshairLabel(chart: Chart, xCenterPixel: number, opts: LabelingOptions) {
	const { ctx, chartArea } = chart;

	const xVal = chart.scales[opts.scaleId].getValueForPixel(xCenterPixel) as number;
	const { text, color } = interpretOpts(opts, xVal);

	ctx.save();
	ctx.fillStyle = '#272626';
	ctx.font = '14px Paralucent';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'top';

	const textWidth = ctx.measureText(text).width;
	const textHeight = 12;
	const padding = 5;
	const boxWidth = textWidth + padding * 2;
	const boxHeight = textHeight + padding * 2;
	const boxX = xCenterPixel - boxWidth / 2;
	const boxY = chartArea.bottom + padding - chart.scales.x.height;

	ctx.beginPath();

	ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 3);
	ctx.fill();

	ctx.fillStyle = color;
	ctx.fillText(text, xCenterPixel, boxY + padding);
	ctx.restore();
}

function renderYCrosshairLabel(chart: Chart, yCenterPixel: number, opts: LabelingOptions) {
	const { ctx } = chart;

	const scale = chart.scales[opts.scaleId];
	const yVal = scale.getValueForPixel(yCenterPixel) as number;

	const { text, color } = interpretOpts(opts, yVal);

	ctx.save();
	ctx.fillStyle = '#272626';
	ctx.font = '14px Paralucent';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	const textWidth = ctx.measureText(text).width;
	const textHeight = 12;
	const padding = 5;
	const boxWidth = textWidth + padding * 2;
	const boxHeight = textHeight + padding * 2;
	const boxX = scale.left;
	const boxY = yCenterPixel - boxHeight / 2;

	ctx.beginPath();

	ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 3);
	ctx.fill();

	ctx.fillStyle = color;
	ctx.fillText(text, boxX + boxWidth / 2, yCenterPixel);
	ctx.restore();
}

function drawIntersections(
	chart: Chart_,
	opts: {
		labelOptions: LabelingOptions[];
		drawLabels?: boolean;
		drawPoints?: boolean;
		xVal: number;
		xPixel: number;
	}
) {
	const { drawLabels = true, drawPoints = true, xVal, xPixel, labelOptions } = opts;

	const { ctx } = chart;
	const { chartArea } = chart;

	ctx.save();

	if (drawLabels) {
		ctx.font = '14px Paralucent';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
	}

	const labelsToDraw: { label: string; value: string; totalW: number; color: string }[] = [];

	for (const datasetMeta of chart.getSortedVisibleDatasetMetas()) {
		const yAxisID = datasetMeta.yAxisID as string;

		const datasetYScaleOpts = labelOptions.find((i) => i.scaleId === yAxisID);

		if (!datasetYScaleOpts) {
			console.error(`No label options found for scale ${yAxisID}`);
			continue;
		}

		const datapoint = datasetMeta._parsed.find((i: any) => i.x === xVal) as any;

		if (!datapoint) continue;

		const { text, color } = interpretOpts(datasetYScaleOpts!, datapoint.y);

		if (drawLabels) {
			const textWithLabel = `${datasetYScaleOpts!.label}: ${text}`;

			labelsToDraw.push({
				label: datasetYScaleOpts.label,
				value: text,
				totalW: ctx.measureText(textWithLabel).width,
				color
			});
		}

		if (drawPoints) {
			const yPixel = chart.scales[yAxisID].getPixelForValue(datapoint.y);

			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(xPixel, yPixel, 5, 0, 2 * Math.PI);
			ctx.fill();
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 1;
			ctx.stroke();
		}
	}

	// Draw labels
	let leftAcc = 0;
	let topAcc = 2;

	const maxWidth = Math.max(...labelsToDraw.map((l) => l.totalW)) + 10;

	for (const label of labelsToDraw) {
		ctx.fillStyle = label.color;

		const labelText = label.label + ': ';

		if (chart._crosshairCache.opts.labelStackDirection === 'horizontal') {
			ctx.fillText(labelText, chartArea.left + leftAcc, chartArea.top);
			leftAcc += ctx.measureText(labelText).width;

			ctx.fillText(label.value, chartArea.left + leftAcc, chartArea.top);
			leftAcc += ctx.measureText(label.value).width + 10;
		} else {
			ctx.fillText(labelText, chartArea.left, chartArea.top + topAcc);

			const valWidth = ctx.measureText(label.value).width;
			ctx.fillText(label.value, chartArea.left + maxWidth - valWidth, chartArea.top + topAcc);
		}

		// leftAcc += label.totalW + 10;
		topAcc += ctx.measureText(label.value).emHeightAscent + 10;
	}

	ctx.restore();
}

const defaultOptions: CrosshairPluginConfig = {
	labels: [],
	crosshairEnableDelay: 500,
	labelStackDirection: 'horizontal'
};

export const CrosshairPlugin: Plugin = {
	id: 'crosshair',
	beforeInit(chart: Chart) {
		// Register listening for pointerdown and pointerup events
		// chart.options.events = chart.options.events || [];
		// if (!chart.options.events.includes('pointermove')) {
		// 	chart.options.events.push('pointermove');
		// }
	},
	afterInit: (chart: Chart_) => {
		const userOpts = (chart.options.plugins as any)['crosshair'] as CrosshairPluginConfig;
		const opts = Object.assign({}, defaultOptions, userOpts);

		chart._crosshairCache = {
			enabledByTouch: false,
			datasetCache: [],
			opts,
			coords: null,
			lastToucheventCoords: {
				x: 0,
				y: 0
			},
			totalLastTouchSeqDelta: {
				x: 0,
				y: 0
			},
			crosshairEnabledInLastTouchSeq: false,
			lastUsedInputInterface: 'mouse',
			customEventHandlers: []

			// It is safer to have the original pan enabled
			// panEnableBeforeTouchSeq: true
		} as CrosshairCache;

		if (opts.labels.length < 1) return;

		function touchmoveHandler(e: TouchEvent) {
			const deltaX = e.touches[0].clientX - chart._crosshairCache.lastToucheventCoords.x;
			const deltaY = e.touches[0].clientY - chart._crosshairCache.lastToucheventCoords.y;

			chart._crosshairCache.totalLastTouchSeqDelta.x += deltaX;
			chart._crosshairCache.totalLastTouchSeqDelta.y += deltaY;

			chart._crosshairCache.lastToucheventCoords = {
				x: e.touches[0].clientX,
				y: e.touches[0].clientY
			};

			chart._crosshairCache.coords = {
				x: chart._crosshairCache.coords!.x + deltaX,
				y: chart._crosshairCache.coords!.y + deltaY
			};

			chart.render();
		}

		function touchstartHanlder(e: TouchEvent) {
			chart._crosshairCache.lastUsedInputInterface = 'touch';

			const crossEnabled = chart._crosshairCache.enabledByTouch;

			// Remember crosshair coords
			if (!crossEnabled) {
				const touch = e.changedTouches[0];
				const rect = chart.canvas.getBoundingClientRect();

				const touchX = touch.clientX - rect.left;
				const touchY = touch.clientY - rect.top;

				chart._crosshairCache.coords = {
					x: touchX,
					y: touchY
				};
			}

			chart._crosshairCache.lastToucheventCoords = {
				x: e.touches[0].clientX,
				y: e.touches[0].clientY
			};

			chart._crosshairCache.totalLastTouchSeqDelta = {
				x: 0,
				y: 0
			};

			if (crossEnabled) {
				chart._crosshairCache.crosshairEnabledInLastTouchSeq = false;
			}

			const timeout = setTimeout(() => {
				// If the finger has moved too much, it means
				// the user wanted to pan or zoom, don't do
				// anything in that case
				const totalDelta =
					Math.abs(chart._crosshairCache.totalLastTouchSeqDelta.x) +
					Math.abs(chart._crosshairCache.totalLastTouchSeqDelta.y);

				if (totalDelta > 10) {
					return;
				}

				chart._crosshairCache.enabledByTouch = true;
				chart._crosshairCache.crosshairEnabledInLastTouchSeq = true;

				// In crosshair mode, disable panning
				// @ts-ignore
				chart.options.plugins.zoom.pan.enabled = false;

				chart.render();
			}, chart._crosshairCache.opts.crosshairEnableDelay);

			// If the user lifts the finger before the mode is enabled, clear the timeout
			chart.canvas.addEventListener(
				'touchend',
				() => {
					clearTimeout(timeout);
				},
				{ once: true }
			);
		}

		function touchendHandler(e: TouchEvent) {
			if (
				!chart._crosshairCache.crosshairEnabledInLastTouchSeq &&
				chart._crosshairCache.totalLastTouchSeqDelta.x === 0 &&
				chart._crosshairCache.totalLastTouchSeqDelta.y === 0
			) {
				chart._crosshairCache.enabledByTouch = false;

				// @ts-ignore
				console.log('enabling pan');
				chart.options.plugins.zoom.pan.enabled = true;
				chart.pan(0);

				chart.render();
			}
		}

		function pointermoveHandler(e: PointerEvent) {
			if (e.pointerType === 'mouse') {
				chart._crosshairCache.lastUsedInputInterface = 'mouse';

				const canvasRect = chart.canvas.getBoundingClientRect();

				chart._crosshairCache.coords = {
					x: e.clientX - canvasRect.left,
					y: e.clientY - canvasRect.top
				};

				chart.render();
			}
		}

		function pointerleaveHandler(e: PointerEvent) {
			if (e.pointerType === 'mouse') {
				chart._crosshairCache.coords = null;
				chart.render();
			}
		}

		chart.canvas.addEventListener('touchmove', touchmoveHandler);
		chart.canvas.addEventListener('touchstart', touchstartHanlder);
		chart.canvas.addEventListener('touchend', touchendHandler);
		chart.canvas.addEventListener('pointermove', pointermoveHandler);
		chart.canvas.addEventListener('pointerleave', pointerleaveHandler);

		chart._crosshairCache.customEventHandlers = [
			{
				event: 'touchmove',
				handler: touchmoveHandler
			},
			{
				event: 'touchstart',
				handler: touchstartHanlder
			},
			{
				event: 'touchend',
				handler: touchendHandler
			},
			{
				event: 'pointermove',
				handler: pointermoveHandler
			},
			{
				event: 'pointerleave',
				handler: pointerleaveHandler
			}
		];
	},
	beforeDestroy: (chart: Chart_) => {
		for (const { event, handler } of chart._crosshairCache.customEventHandlers) {
			chart.canvas?.removeEventListener(event, handler);
		}
	},
	// afterEvent: (chart: Chart_, args) => {
	// 	const { event } = args;

	// 	const e = event.native as PointerEvent;

	// 	console.log(e);

	// 	if (e && e.pointerType === 'mouse') {
	// 		console.log('mouse');
	// 		chart._crosshairCache.lastUsedInputInterface = 'mouse';

	// 		const canvasRect = chart.canvas.getBoundingClientRect();

	// 		chart._crosshairCache.coords = {
	// 			x: e.clientX - canvasRect.left,
	// 			y: e.clientY - canvasRect.top
	// 		};

	// 		args.changed = true;
	// 	}
	// },
	afterDraw: (chart: Chart_) => {
		const options = chart._crosshairCache.opts;

		if (options.labels.length < 1) return;

		const { ctx } = chart;
		const coords = chart._crosshairCache.coords;

		if (!coords) return;

		if (
			chart._crosshairCache.lastUsedInputInterface === 'touch' &&
			!chart._crosshairCache.enabledByTouch
		)
			return;

		const { x, y } = coords;

		// Get nearest value from x axis
		const xDataset = chart.data.datasets[0];

		const xScale = chart.scales[(xDataset as any).xAxisID as string];

		// TODO this should be taken somewhere from chart JS internals
		// rather than trying labels and datasets for X values.
		const xVals = (chart.data.labels || []) as number[];

		if (xVals.length < 1) {
			xVals.push(...xDataset.data.map((i: any) => i.x));
		}

		const xVal = xScale.getValueForPixel(x) as number;

		const largerXVal = xVals.find((i: number) => i > xVal) as any;
		const smallerXVal = xVals.findLast((i: number) => i < xVal) as any;

		let nearestXVal = null;

		if (largerXVal && smallerXVal) {
			nearestXVal =
				Math.abs(largerXVal - xVal) < Math.abs(smallerXVal - xVal) ? largerXVal : smallerXVal;
		}

		const nearestXPixel = xScale.getPixelForValue(nearestXVal);

		const chartArea = chart.chartArea;

		ctx.save();
		ctx.lineWidth = 1;
		ctx.setLineDash([5, 5]); // Dashed line
		ctx.strokeStyle = 'white';

		// Draw vertical line
		ctx.beginPath();
		ctx.moveTo(nearestXPixel, chartArea.top);
		ctx.lineTo(nearestXPixel, chartArea.bottom);
		ctx.stroke();

		// Draw horizontal line
		ctx.beginPath();
		ctx.moveTo(chartArea.left, y);
		ctx.lineTo(chartArea.right, y);
		ctx.stroke();

		ctx.restore();

		for (const labelOpts of options.labels) {
			const { scaleId } = labelOpts;
			const scale = chart.scales[scaleId];

			if (scale.axis === 'x') {
				renderXCrosshairLabel(chart, nearestXPixel, labelOpts);
			} else {
				renderYCrosshairLabel(chart, y, labelOpts);
			}
		}

		const yScales = options.labels.filter((i) => chart.scales[i.scaleId].axis === 'y');

		drawIntersections(chart, { xVal: nearestXVal, xPixel: nearestXPixel, labelOptions: yScales });
	}
};

// Fix for HMR
Chart.unregister(CrosshairPlugin);

Chart.register(CrosshairPlugin);
