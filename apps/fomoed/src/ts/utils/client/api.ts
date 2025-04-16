import { derived, get, writable } from 'svelte/store';
import type { ForeignInstrument } from '.';

async function fetchSupportedExchangePairs() {
	const res = await fetch('/api/supported-exchange-pairs');
	const data = await res.json();

	return data.data;
}

type ExchangeName = string;
export type SupportedPairsData = Record<ExchangeName, ForeignInstrument[]>;

const cachedSupportedPairs = writable<SupportedPairsData | null>(null);

export const cgSupportedExchangeLiqMapBaseAssets = derived<typeof cachedSupportedPairs, string[]>(
	cachedSupportedPairs,
	(pairs) => {
		if (!pairs) {
			return [];
		}

		const fromMainExchanges = [...pairs['Binance'], ...pairs['OKX'], ...pairs['Bybit']];
		const baseAssets: string[] = [];

		for (const supportedPair of fromMainExchanges) {
			if (!baseAssets.includes(supportedPair.baseAsset)) {
				baseAssets.push(supportedPair.baseAsset);
			}
		}

		return baseAssets;
	}
);

export async function getCacheOrFetchSupportedExchangePairs(): Promise<SupportedPairsData> {
	const cached = get(cachedSupportedPairs);

	if (cached) {
		return cached;
	}

	const fetched = await fetchSupportedExchangePairs();

	cachedSupportedPairs.set(fetched);

	return fetched;
}
