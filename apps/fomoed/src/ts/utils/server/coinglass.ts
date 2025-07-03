import { PRIVATE_COINGLASS_KEY } from '$env/static/private';
import { error } from '@sveltejs/kit';

export async function fetchCoinglassHeatmap(range: string, exchange: string, symbol: string) {
	const url = `https://open-api-v3.coinglass.com/api/futures/liquidation/heatmap?exchange=${exchange}&symbol=${symbol}&range=${range}`;
	const options = {
		method: 'GET',
		headers: { accept: 'application/json', 'CG-API-KEY': PRIVATE_COINGLASS_KEY }
	};

	const res = await fetch(url, options);
	const data = await res.json();

	if (!res.ok) {
		console.error(data);
	}

	return data;
}

export async function fetchCoinglassLiqMap(range: string, exchange: string, symbol: string) {
	const url = `https://open-api-v3.coinglass.com/api/futures/liquidation/map?exchange=${exchange}&symbol=${symbol}&range=${range}`;
	const options = {
		method: 'GET',
		headers: { accept: 'application/json', 'CG-API-KEY': PRIVATE_COINGLASS_KEY }
	};

	const res = await fetch(url, options);
	const data = await res.json();

	if (!res.ok) {
		console.error(data);
	}

	return data;
}

export async function fetchCoinglassSupportedPairs() {
	const url = 'https://open-api-v3.coinglass.com/api/futures/supported-exchange-pairs';
	const options = {
		method: 'GET',
		headers: { accept: 'application/json', 'CG-API-KEY': PRIVATE_COINGLASS_KEY }
	};

	const res = await fetch(url, options);
	const data = await res.json();
	if (!res.ok || !data.success) {
		console.error(data);
	}

	return data;
}

export async function fetchPairMarkets(symbol: string) {
	const url = `https://open-api-v3.coinglass.com/api/futures/pairs-markets?symbol=${symbol}`;
	const options = {
		method: 'GET',
		headers: { accept: 'application/json', 'CG-API-KEY': PRIVATE_COINGLASS_KEY }
	};

	const res = await fetch(url, options);
	const data = await res.json();

	if (!res.ok) {
		error(500, data.msg);
	}

	return data;
}

export async function fetchAssetPriceUsd(symbol: string): Promise<number> {
	const pairMarketsData = await fetchPairMarkets(symbol);

	const pairMarketData = pairMarketsData.data.data.find(
		(i: any) => i.symbol === symbol + '/' + 'USDT'
	);

	return pairMarketData.price;
}
