export class DashboardService {
	getLastDisplayedChartIndex() {
		return parseInt(localStorage.getItem('lastDisplayedChartIndex') || '0') || 0;
	}

	setLastDisplayedChartIndex(index: number) {
		localStorage.setItem('lastDisplayedChartIndex', index.toString());
	}
}
