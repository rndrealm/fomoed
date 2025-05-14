export type PriceData = {
	close: number;
	high: number;
	low: number;
	open: number;
	price_volume: number;
	timestamp: number;
	volume: number;
	vwap: number;
};

export type PriceDataArray = PriceData[];

export type FootprintData = {
	price: number;
	side: 'buy' | 'sell';
	size: number;
	timestamp: number;
	isHighestCandleVol?: boolean;
};

export type FootprintDataArray = FootprintData[];

export type CignalsDatapoint = {
	candle: PriceData;
	footprints: FootprintData[];
};

export type CignalsDatapointArray = CignalsDatapoint[];

export type CignalsInstrument = {
	id: number;
	expiry: number | null;
	perpetual: boolean;
	exchange: string;
	base_currency: string;
	quote_currency: string;
	symbol: string;
};

export type ParsedCignalsInstrument = { label: string } & CignalsInstrument;

export type ParsedCignalsInstrumentArray = ParsedCignalsInstrument[];

export const availableCignalTimesteps = [
	'1m',
	'5m',
	'15m',
	'30m',
	'1h',
	'4h',
	'8h',
	'12h',
	'1D',
	'3D',
	'1W',
	'1M'
] as const;

export type CignalsTimestep = (typeof availableCignalTimesteps)[number];

export interface CignalsDatapointFetchOptions {
	instrument_id: string;
	start_range: number; // Start of the range in Unix epoch milliseconds (inclusive)
	end_range: number; // End of the range in Unix epoch milliseconds (exclusive)
	price_step: number | 'auto'; // Price grouping to use
	time_step: CignalsTimestep;
}

export type CignalsChartOptions = {
	instrument: ParsedCignalsInstrument;
	timeInterval: CignalsTimestep;
	priceStep: number | null;
};
