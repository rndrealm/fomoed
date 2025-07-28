import { browser } from '$app/environment';
import { sleep } from '$lib';
import { cfgi_supported_tokens } from '$lib/utils/cfgi_data';
import { liveDataService } from './LiveSymbolDataService.client.svelte';

export type AvailableCfgiSymbol = {
	symbol: string;
	name: string;
};

export type CfgiDataPoint = {
	date: string;
	price: number;
	cfgi: number;
	data_price: number;
	data_volatility: number;
	data_volume: number;
	data_impulse: number;
	data_technical: number;
	data_social: number;
	data_dominance: number;
	data_trends: number;
	datas_whales: number;
	data_orders: number;
};

export class CfgiDataService {
	availableSymbols: AvailableCfgiSymbol[] = $state([]);
	cfgiData: Map<string, CfgiDataPoint[]> = $state(new Map());

	async refreshAvailableSymbols() {
		let symbols: AvailableCfgiSymbol[] = [];

		// Create AvailableCfgiSymbol objects for each supported token
		for (const symbol of cfgi_supported_tokens) {
			// Try to find the matching live data
			const liveData = liveDataService.liveSymbolData.get(symbol);

			symbols.push({
				symbol: symbol,
				name: liveData ? liveData.name : symbol // Fall back to symbol as name if no live data
			});
		}

		// Update the reactive state
		this.availableSymbols = symbols;
	}

	async fetchCfgiData(symbol: string, retryAttempt: number = 0): Promise<void> {
		const MAX_RETRIES = 5;
		const BASE_DELAY_MS = 1000;

		const url = new URL('/api/cfgi-new', window.location.origin);
		url.searchParams.set('symbol', symbol);

		let response: Response;

		try {
			response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
		} catch (error) {
			console.error(`Error fetching CFGI data for ${symbol}:`, error);
			return;
		}

		// If too many requests are made on CFGI API, implement exponential backoff
		if (response.status === 429) {
			if (retryAttempt >= MAX_RETRIES) {
				console.error(`Maximum retry attempts (${MAX_RETRIES}) reached for ${symbol}`);
				return;
			}

			// Calculate exponential backoff with jitter
			const backoffTime = Math.pow(2, retryAttempt) * BASE_DELAY_MS;
			const jitter = Math.random() * 0.3 * backoffTime; // Add up to 30% randomness
			const delayMs = backoffTime + jitter;

			console.info(
				`Rate limit exceeded for CFGI data for ${symbol}. Retrying in ${Math.round(delayMs)}ms (attempt ${retryAttempt + 1}/${MAX_RETRIES})`
			);

			await sleep(delayMs);

			// Retry with incremented retry count
			return this.fetchCfgiData(symbol, retryAttempt + 1);
		}

		if (!response.ok) {
			throw new Error(`Failed to fetch CFGI data for ${symbol}`);
		}

		// Parse the response data
		const data = await response.json();

		// Store in the reactive Map
		this.cfgiData.set(symbol, data.data || []);

		this.cfgiData = new Map(this.cfgiData);
	}
}

export const cfgiDataService = new CfgiDataService();

if (browser) {
	cfgiDataService.refreshAvailableSymbols();
}
