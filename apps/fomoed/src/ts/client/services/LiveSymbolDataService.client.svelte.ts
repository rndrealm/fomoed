import { browser } from '$app/environment';
import { refresh_coinstats_coin_list } from '$lib/utils';

export type LiveSymbolData = {
	symbol: string;
	name: string;
	iconUrl: string;
	price: number;
	change24h: number;
	volume24h: number;
};

export type GlobalMarketData = {
	marketCap: number;
	volume: number;
	btcDominance: number;
	marketCapChange: number;
	volumeChange: number;
	btcDominanceChange: number;
};

export class LiveDataService {
	liveSymbolData: Map<string, LiveSymbolData> = $state(new Map());
	globalMarketData: GlobalMarketData | null = $state(null);
	#refreshIntervalId: ReturnType<typeof setInterval> | null = null;

	constructor() {}

	async refreshData() {
                const coins = await refresh_coinstats_coin_list();
		let globalData: GlobalMarketData | null = null;

		// Create a new map with updated data
		const updatedData = new Map<string, LiveSymbolData>();

		for (const coin of coins) {
			if (updatedData.has(coin.s)) {
				continue;
			}

			updatedData.set(coin.s, {
				symbol: coin.s,
				name: coin.n,
				iconUrl: coin.ic,
				price: coin.pu,
				change24h: coin.p24,
				volume24h: coin.v
			});
		}

		// Update the reactive state
		this.liveSymbolData = updatedData;
	}

	async refreshGlobalData() {
		try {
			const response = await fetch('https://api.coin-stats.com/v2/markets/global');
			const data = await response.json();

			console.log({ data });

			if (data) {
				this.globalMarketData = {
					marketCap: data.globalData.marketCap || 0,
					volume: data.globalData.volume || 0,
					btcDominance: data.globalData.btcDominance || 0,
					marketCapChange: data.globalData.marketCapChange || 0,
					volumeChange: data.globalData.volumeChange || 0,
					btcDominanceChange: data.globalData.btcDominanceChange || 0
				};
			}
		} catch (error) {
			console.error('Failed to fetch global market data:', error);
		}
	}

	setupRefreshInterval(ms: number): void {
		// Clear any existing interval
		if (this.#refreshIntervalId !== null) {
			clearInterval(this.#refreshIntervalId);
			this.#refreshIntervalId = null;
		}

		// Set up a new interval
		this.#refreshIntervalId = setInterval(() => {
			this.refreshData();
		}, ms);
	}
}

export const liveDataService = new LiveDataService();

if (browser) {
	liveDataService.setupRefreshInterval(5000);
	// Initial data fetch
	liveDataService.refreshData();
	liveDataService.refreshGlobalData();
}
