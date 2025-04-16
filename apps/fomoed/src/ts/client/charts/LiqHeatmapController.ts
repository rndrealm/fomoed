import { ScatterController, BarController } from 'chart.js';
import { resolveObjectKey } from 'chart.js/helpers';

export class LiqHeatmapController extends ScatterController {
	draw() {
		const meta = this.getMeta();
		const ctx = this.chart.ctx;

		const { chart, _cachedMeta } = this;
		const { x: xScale, y: yScale } = chart.scales;
		const points = _cachedMeta.data;

		const dataset = chart.data.datasets[_cachedMeta.index];
		const unparsedData = dataset.data; // Original unparsed data

		const barWidth = (chart.getDatasetMeta(0).data[0].width || 5) * 2;

		ctx.save();

		ctx.lineWidth = 1;
		ctx.strokeStyle = 'white';

		for (let i = 0; i < points.length; i++) {
			const p = points[i];
			const { x, y } = p.getProps(['x', 'y']);

			ctx.fillStyle = unparsedData[i].backgroundColor;
			const prevYVal = unparsedData[i].prevYVal;

			const height = y - yScale.getPixelForValue(prevYVal);

			ctx.fillRect(x - barWidth / 2, y, barWidth, height);

			if (p.active) {
				ctx.strokeRect(x - barWidth / 2, y, barWidth, height);
			}
			// ctx.fill();
			// ctx.stroke();
		}

		ctx.restore();
	}
}
LiqHeatmapController.id = 'liqHeatmap';
LiqHeatmapController.defaults = ScatterController.defaults;
