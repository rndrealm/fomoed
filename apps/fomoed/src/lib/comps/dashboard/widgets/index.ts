import type { Chart } from 'chart.js';
import { tick } from 'svelte';

export interface DashboardWidgetProps {
	isFullscreen: boolean;
	registerBeforeWidgetResizeHandler: (callback: () => void) => void;
	registerAfterWidgetResizeHandler: (callback: () => void) => void;
}

function beforeWidgetResizeHandlerChartJs(chart: Chart) {
	chart.canvas.style.opacity = '0';
}

function afterWidgetResizeHandlerChartJs(chart: Chart) {
	chart.resize(0, 0);

	tick().then(() => {
		chart.resize();
		chart.canvas.style.opacity = '1';
	});
}

export function registerResizeHandlersChartJs(chart: Chart, props: DashboardWidgetProps) {
	props.registerBeforeWidgetResizeHandler(() => beforeWidgetResizeHandlerChartJs(chart));
	props.registerAfterWidgetResizeHandler(() => afterWidgetResizeHandlerChartJs(chart));
}
