import dayjs from 'dayjs';
import type {
	CignalsDatapointArray,
	CignalsDatapointFetchOptions,
	ParsedCignalsInstrumentArray,
	FootprintData,
	FootprintDataArray,
	PriceData,
	PriceDataArray,
	CignalsInstrument
} from '$lib/types';
import { smartRoundPriceStep } from '$ts/client/utils/ui';
import { capitalize } from 'lodash-es';

abstract class CignalsChartDataProviderBase {
	lastUsedFootprintPriceStep = 0;

	protected abstract fetchFootprints(
		options: CignalsDatapointFetchOptions
	): Promise<FootprintDataArray>;
	protected abstract fetchOHLC(options: CignalsDatapointFetchOptions): Promise<PriceDataArray>;
	abstract fetchDatapoints(options: CignalsDatapointFetchOptions): Promise<CignalsDatapointArray>;
	abstract fetchInstruments(): Promise<ParsedCignalsInstrumentArray>;

	static parsePriceData(data: any): PriceData {
		return {
			close: parseFloat(data.close),
			high: parseFloat(data.high),
			low: parseFloat(data.low),
			open: parseFloat(data.open),
			price_volume: parseFloat(data.price_volume),
			timestamp: data.timestamp,
			volume: parseFloat(data.volume),
			vwap: parseFloat(data.vwap)
		};
	}

	static parseFootprintData(data: any): FootprintData {
		return {
			price: parseFloat(data.price),
			side: data.side,
			size: parseFloat(data.size),
			timestamp: data.timestamp
		};
	}
}

class CignalsChartDataProviderAPI extends CignalsChartDataProviderBase {
	#cignalsHost = 'https://api.cignals.io';

	private async fetchThroughCignalsRelay(cignalsUrl: URL) {
		const urlAsString = cignalsUrl.toString();
		const base64url = btoa(urlAsString);

		const fomoedUrl = new URL(window.location.origin + '/api/cignals/relay');
		fomoedUrl.searchParams.append('path', base64url);

		const response = await fetch(fomoedUrl, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`Error fetching through cignals relay: ${response.statusText}`);
		}

		return response.json();
	}

	async fetchInstruments(): Promise<ParsedCignalsInstrumentArray> {
		const url = new URL(this.#cignalsHost + '/v1/instruments');
		const data = (await this.fetchThroughCignalsRelay(url)) as CignalsInstrument[];

		const parsed = data.map((i) => {
			const exchange = capitalize(i.exchange.replace('_', ' '));
			const perp = i.perpetual ? ' PERP' : '';

			return {
				...i,
				label: `${exchange} ${i.base_currency.toUpperCase()}/${i.quote_currency.toUpperCase()}${perp}`
			};
		});

		return parsed;
	}

	async fetchFootprints(
		options: CignalsDatapointFetchOptions & { price_step: number }
	): Promise<FootprintDataArray> {
		const url = new URL(window.location.origin + '/api/cignals/footprints');

		url.searchParams.append('instrument_id', options.instrument_id);
		url.searchParams.append('start_range', options.start_range.toString());
		url.searchParams.append('end_range', options.end_range.toString());
		url.searchParams.append('price_step', options.price_step.toString());
		url.searchParams.append('time_step', options.time_step);

		const response = await fetch(url.toString());
		const data = await response.json();
		const parsed = data.map(CignalsChartDataProviderAPI.parseFootprintData);

		this.lastUsedFootprintPriceStep = options.price_step;

		return parsed;
	}

	async fetchOHLC(options: CignalsDatapointFetchOptions): Promise<PriceDataArray> {
		const url = new URL(this.#cignalsHost + '/v1/ohlc');

		url.searchParams.append('instrument_id', options.instrument_id);
		url.searchParams.append('start_range', options.start_range.toString());
		url.searchParams.append('end_range', options.end_range.toString());
		url.searchParams.append('time_step', options.time_step);

		const data = await this.fetchThroughCignalsRelay(url);
		const parsed = data.map(CignalsChartDataProviderAPI.parsePriceData);

		return parsed;
	}

	async fetchDatapoints(options: CignalsDatapointFetchOptions): Promise<CignalsDatapointArray> {
		const candles = await this.fetchOHLC(options);

		let priceStepToUse: number;

		// Calculate optimal price step
		if (options.price_step === 'auto') {
			const preferredFootprintVerticalCount = 30; // Magic number, ask before adjusting
			const averageCandleRange =
				candles.reduce((acc, candle) => {
					return acc + candle.high - candle.low;
				}, 0) / candles.length;
			const priceStep = averageCandleRange / preferredFootprintVerticalCount;
			const roundedPriceStep = smartRoundPriceStep(priceStep);

			priceStepToUse = roundedPriceStep;

			console.log({ roundedPriceStep });
		} else {
			priceStepToUse = options.price_step;
		}

		const footprints = await this.fetchFootprints({
			...options,
			price_step: priceStepToUse
		});

		const datapoints: CignalsDatapointArray = [];

		for (const candle of candles) {
			// Optimize
			const candleTimestamp = candle.timestamp;
			const candleFootprints = footprints.filter(
				(footprint) => footprint.timestamp == candleTimestamp
			);

			datapoints.push({
				candle,
				footprints: candleFootprints
			});
		}

		return datapoints;
	}
}

// This is used for quick testing without access to cignals API.
class CignalsChartDataProviderDummy extends CignalsChartDataProviderBase {
	static now = dayjs();

	fetchInstruments(): Promise<ParsedCignalsInstrumentArray> {
		throw new Error('Method not implemented.');
	}

	async fetchFootprints(): Promise<FootprintDataArray> {
		const footprintsRes = await fetch('/dummies/footprint_data.json');
		const parsedFootprints = (await footprintsRes.json()).map(
			CignalsChartDataProviderAPI.parseFootprintData
		);
		return parsedFootprints;
	}

	async fetchOHLC(): Promise<PriceDataArray> {
		const candlesRes = await fetch('/dummies/candle_data.json');
		const parsedCandles = (await candlesRes.json()).map(CignalsChartDataProviderAPI.parsePriceData);
		return parsedCandles;
	}

	async fetchDatapoints(options: CignalsDatapointFetchOptions): Promise<CignalsDatapointArray> {
		throw new Error('Method not implemented.');
	}
}

export { CignalsChartDataProviderBase, CignalsChartDataProviderAPI, CignalsChartDataProviderDummy };
