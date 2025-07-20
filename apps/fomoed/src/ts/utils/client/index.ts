import type { SupportedPairsData } from './api';

export function humanizeNumber(num: number) {
	if (num < 1000) {
		return num.toString(); // Less than 1000, return the number as it is
	} else if (num >= 1000 && num < 1000000) {
		return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'; // Thousand (K)
	} else if (num >= 1000000 && num < 1000000000) {
		return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'; // Million (M)
	} else if (num >= 1000000000) {
		return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'; // Billion (B)
	}

	return num.toString();
}

export type ForeignInstrument = {
	instrument_id: string;
	base_asset: string;
	quote_asset: string;
};

export type InstrumentInfo = ForeignInstrument & { exchange: string; symbol: string };
export const defaultSelectedInstrument: InstrumentInfo = {
	instrument_id: 'BTCUSD_PERP',
	base_asset: 'BTC',
	quote_asset: 'USDT',
	exchange: 'Binance',
	symbol: 'BTCUSDT'
};

function isInstrumentIdAnOption(instrumendId: string) {
	return !isLettersOnly(instrumendId);
}

export function supportedExchangePairsToOptions(
	supportedExchangePairs: SupportedPairsData,
	excludeOptions: boolean = true
) {
	if (!supportedExchangePairs) {
		return [];
	}

	const options: { label: string; value: InstrumentInfo }[] = [];

	for (const [exchangeName, instruments] of Object.entries(supportedExchangePairs)) {
		for (const instrument of instruments as any) {
			if (excludeOptions && isInstrumentIdAnOption(instrument.instrumentId)) {
				continue;
			}

			options.push({
				label: exchangeName + ' ' + instrument.base_asset + '/' + instrument.quote_asset,
				value: {
					...instrument,
					exchange: exchangeName,
					symbol: instrument.base_asset + instrument.quote_asset
				}
			});
		}
	}

	return options;
}

export function isLettersOnly(str: string) {
	return /^[a-zA-Z]+$/.test(str);
}
