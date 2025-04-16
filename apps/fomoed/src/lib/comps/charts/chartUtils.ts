import type { ICoinCfgiPriceData } from '$lib';
import { coinstats_selected_coin } from '$lib/stores';
import { failure } from '$lib/utils';
import { supportedExchangePairsToOptions, type InstrumentInfo } from '$ts/utils/client';
import {
	cgSupportedExchangeLiqMapBaseAssets,
	getCacheOrFetchSupportedExchangePairs
} from '$ts/utils/client/api';
import { maxBy, range, sumBy } from 'lodash-es';
import { get } from 'svelte/store';

export async function fetchCfgi(daysBack: number) {
	const _selectedCoin = get(coinstats_selected_coin);

	const data = await fetch(`/api/cfgi`, {
		method: 'POST',
		body: JSON.stringify({
			token_symbol: _selectedCoin.symbol,
			token_name: _selectedCoin.name,
			token_slug: _selectedCoin.slug,
			days_back: daysBack
		})
	})
		.then((res) => res.json())
		.then((res) => res.data as ICoinCfgiPriceData[])
		.catch((err) => {
			console.error(err);

			return [];
		});

	return data;
}

export async function fetchHeatmapData(timeframe: string, exchange: string, symbol: string) {
	const res = await fetch(
		`/api/liquidity-heatmap?timeframe=${timeframe}&exchange=${exchange}&symbol=${symbol}`
	);

	if (!res.ok) {
		failure('Failed to fetch data!');
		return null;
	}

	const data = await res.json();

	return data.data;
}

export type LiquidationBar = {
	x: number;
	y: number;
	color: string;
};

export type CumulativeLeveragePoint = {
	x: number;
	y: number;
};

export type LiqMapData = {
	liqBars: LiquidationBar[];
	currentPrice: number;
	cumulativeLongLiqLeverage: CumulativeLeveragePoint[];
	cumulativeShortLiqLeverage: CumulativeLeveragePoint[];
	maxCumulativeValue: number;
	minPrice: number;
	maxPrice: number;
};

type FetchLiqMapDataInstrument = {
	exchange: string;
	instrumentId: string;
	baseAsset: string;
	quoteAsset: string;
};

function getLiqBarColorFromLevRatio(leverage: number) {
	if (leverage === 100) {
		return '#FF8300';
	}

	if (leverage === 50) {
		return '#FFC403';
	}

	if (leverage === 25) {
		return '#73D8DA';
	}

	if (leverage === 10) {
		return '#6EC2F0';
	}

	return '#0000';
}

export async function fetchLiqMapData(
	timeframe: string,
	instruments: FetchLiqMapDataInstrument[]
): Promise<LiqMapData | null> {
	const combinedLiqData: Record<number, [number, number, number, null][]> = {};
	let currentPrice = null;

	for (const instrument of instruments) {
		const res = await fetch(
			`/api/liq-map?timeframe=${timeframe}&exchange=${instrument.exchange}&instrumentId=${instrument.instrumentId}&baseAsset=${instrument.baseAsset}&quoteAsset=${instrument.quoteAsset}`
		);

		if (!res.ok) {
			failure('Failed to fetch data!');

			return null;
		}

		const data_ = await res.json();

		const liquidationData = data_.data.liquidationData.data.data;

		for (const [price, arrays] of Object.entries(liquidationData)) {
			const price_ = parseInt(price);

			if (combinedLiqData[price_]) {
				combinedLiqData[price_].push(...(arrays as any));
			} else {
				combinedLiqData[price_] = arrays as any;
			}
		}

		// Use current price of base asset from the first exchange
		if (currentPrice === null) {
			// Current price is indeed 'price' and not 'indexPrice'
			currentPrice = data_.data.pairMarketData.price;
		}
	}

	const prices = Object.keys(combinedLiqData).map((i) => parseInt(i));
	const minPrice = Math.min(...prices);
	const maxPrice = Math.max(...prices);

	const sparseLiqBars = [];

	// Extract liquidation bars
	for (const [price, arrays] of Object.entries(combinedLiqData)) {
		const price_ = parseInt(price);

		for (const point of arrays as any) {
			const [_, liqLevel, levRatio, null_] = point;

			const liqBar: LiquidationBar = {
				x: price_,
				y: liqLevel,
				color: getLiqBarColorFromLevRatio(levRatio)
			};

			sparseLiqBars.push(liqBar);
		}
	}

	// Sort the liqBars, important
	sparseLiqBars.sort((a, b) => a.x - b.x);

	// Add data for missing prices
	const liqBars: LiquidationBar[] = [];

	let liqBarsIdx = 0;

	for (const price of range(minPrice, maxPrice)) {
		let pushed = false;

		while (sparseLiqBars[liqBarsIdx].x === price) {
			liqBars.push(sparseLiqBars[liqBarsIdx]);
			liqBarsIdx++;
			pushed = true;
		}

		// if (!pushed) {
		// 	liqBars.push({ x: price, y: 0, color: '#0000' });
		// }
	}

	// Extract long cumulative liquidation leverage
	// [price, leverageValue]
	const cumulativeLongLiqLeverage: { x: number; y: number }[] = [];
	const cumulativeShortLiqLeverage: { x: number; y: number }[] = [];
	const lastCurrPriceIdx = liqBars.findLastIndex((i) => i.x < currentPrice) + 1;

	// Long
	let cumulativeLongLiqLeverageAcc = 0;

	for (const liqBar of liqBars.slice(lastCurrPriceIdx, -1)) {
		cumulativeLongLiqLeverageAcc += liqBar.y;
		cumulativeLongLiqLeverage.push({ x: liqBar.x, y: Math.round(cumulativeLongLiqLeverageAcc) });
	}

	// Short
	let cumulativeShortLiqLeverageAcc = 0;

	for (const liqBar of liqBars.slice(0, lastCurrPriceIdx).toReversed()) {
		cumulativeShortLiqLeverageAcc += liqBar.y;
		cumulativeShortLiqLeverage.push({ x: liqBar.x, y: Math.round(cumulativeShortLiqLeverageAcc) });
	}

	return {
		liqBars: liqBars,
		currentPrice,
		cumulativeLongLiqLeverage,
		cumulativeShortLiqLeverage,
		maxCumulativeValue: Math.max(cumulativeLongLiqLeverageAcc, cumulativeShortLiqLeverageAcc),
		minPrice,
		maxPrice
	};
}

export async function fetchLiqMapDataMerged(
	timeframe: string,
	asset: string
): Promise<LiqMapData | null> {
	const res = await fetch(`/api/ex-liq-map?timeframe=${timeframe}&asset=${asset}`);

	if (!res.ok) {
		failure('Failed to fetch data!');
		return null;
	}

	const resData = await res.json();
	const exLiqData = resData.data.exLiqData;
	const currentPriceUsd = parseInt(resData.data.currentPriceUsd);

	const minPrices = [];
	const maxPrices = [];

	for (const ex in exLiqData) {
		const exPrices = Object.keys(exLiqData[ex]).map((i) => parseInt(i));

		minPrices.push(Math.min(...exPrices));
		maxPrices.push(Math.max(...exPrices));
	}

	const minPrice = Math.min(...minPrices);
	const maxPrice = Math.max(...maxPrices);

	if (minPrice === Infinity) {
		// No data
		return null;
	}

	const cumulativeLongLiqLeverage: { x: number; y: number }[] = [];
	const cumulativeShortLiqLeverage: { x: number; y: number }[] = [];

	let cumulativeLongLiqLeverageAcc = 0;

	for (const price of range(currentPriceUsd, maxPrice + 1)) {
		const accBefore = cumulativeLongLiqLeverageAcc;

		for (const ex in exLiqData) {
			cumulativeLongLiqLeverageAcc += exLiqData[ex][price] || 0;
		}

		if (cumulativeLongLiqLeverageAcc === accBefore) {
			continue;
		}

		cumulativeLongLiqLeverage.push({ x: price, y: Math.round(cumulativeLongLiqLeverageAcc) });
	}

	let cumulativeShortLiqLeverageAcc = 0;

	for (const price of range(currentPriceUsd, minPrice - 1, -1)) {
		const accBefore = cumulativeShortLiqLeverageAcc;

		for (const ex in exLiqData) {
			cumulativeShortLiqLeverageAcc += exLiqData[ex][price] || 0;
		}

		if (cumulativeShortLiqLeverageAcc === accBefore) {
			continue;
		}

		cumulativeShortLiqLeverage.push({ x: price, y: Math.round(cumulativeShortLiqLeverageAcc) });
	}

	const exToBarColor: Record<string, string> = {
		Binance: '#FF8300',
		OKX: '#FFC403',
		Bybit: '#73D8DA'
	};

	const combinedLiqBars: LiquidationBar[] = [];

	for (const price of range(minPrice, maxPrice + 1)) {
		const liqValues = [
			{ ex: 'Binance', liqValue: exLiqData['Binance'][price] },
			{ ex: 'OKX', liqValue: exLiqData['OKX'][price] },
			{ ex: 'Bybit', liqValue: exLiqData['Bybit'][price] }
		];
		const maxLiq = maxBy(liqValues, (i) => i.liqValue);

		if (!maxLiq) {
			continue;
		}

		const color = exToBarColor[maxLiq.ex];

		combinedLiqBars.push({ color, x: price, y: sumBy(liqValues, (i) => i.liqValue) });
	}

	return {
		cumulativeLongLiqLeverage,
		cumulativeShortLiqLeverage,
		liqBars: combinedLiqBars,
		currentPrice: currentPriceUsd,
		minPrice,
		maxPrice,
		maxCumulativeValue:
			maxBy([...cumulativeLongLiqLeverage, ...cumulativeShortLiqLeverage], (i) => i.y)?.y || 0
	};
}

export type InstrumentOption = {
	label: string;
	value: InstrumentInfo;
};

export async function getSupportedLiqMapInstrumentOptions(): Promise<InstrumentOption[]> {
	const coinstatsSelectedCoin = get(coinstats_selected_coin);

	if (!coinstatsSelectedCoin) {
		return [];
	}

	const symbol = coinstatsSelectedCoin.symbol;

	const data = await getCacheOrFetchSupportedExchangePairs();
	const options = supportedExchangePairsToOptions(data);

	const filtered = options.filter((i) => i.value.baseAsset === symbol);

	return filtered;
}

export async function getSupportedExchangeLiqMapBaseAssets(
	searchTerm: string | null
): Promise<{ label: string; value: string }[]> {
	// Make sure supported futures are loaded
	await getCacheOrFetchSupportedExchangePairs();

	searchTerm = searchTerm || 'BTC';

	const cgSupported = get(cgSupportedExchangeLiqMapBaseAssets);
	const filtered = cgSupported.filter((i) =>
		i.toLocaleLowerCase().includes(searchTerm.toLowerCase())
	);
	const options = filtered.map((i) => ({ label: i, value: i }));

	return options;
}
