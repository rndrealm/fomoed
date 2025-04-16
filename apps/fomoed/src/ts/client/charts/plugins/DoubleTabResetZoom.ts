import { Chart } from 'chart.js';

const doubleTapResetZoomPlugin = {
	id: 'doubleTapResetZoom',
	beforeInit(chart: Chart) {
		let lastTap = 0;
		let isTouchEvent = false;

		const canvas = chart.canvas;

		const handleEvent = (event: any) => {
			if (event.type === 'touchstart') {
				isTouchEvent = true;
			} else if (event.type === 'mousedown' && isTouchEvent) {
				isTouchEvent = false;
				return;
			}

			if (event.touches && event.touches.length > 1) {
				return;
			}

			const currentTime = new Date().getTime();
			const tapInterval = currentTime - lastTap;

			if (tapInterval < 200 && tapInterval > 0) {
				const originalAnimations = chart.options.animations;

				chart.options.animations = {
					// @ts-ignore
					duration: 100,

					// @ts-ignore
					easing: 'easeOutExpo'
				};

				if (chart.resetZoom) {
					chart.resetZoom();
				}

				// Restore the original animation settings after the reset
				setTimeout(() => {
					chart.options.animations = originalAnimations;
				}, 0);
			}

			lastTap = currentTime;
		};

		canvas.addEventListener('touchstart', handleEvent);
		canvas.addEventListener('mousedown', handleEvent);
	}
};

Chart.register(doubleTapResetZoomPlugin);
