import { writable } from 'svelte/store';
import type { CFGIEnum } from '$lib/utils';
import type { ICoinCfgiPriceData } from '..';
import { CFGI_SUPPORTED_PERIODS_ENUM } from '$lib/utils/cfgi_data';

export type CoinstatsCoinListItem = {
	price: number;
	icon: string;
	symbol: string;
	name: string;
	color: string;
	slug: string;
};

export const coinstats_coin_list = writable<CoinstatsCoinListItem[]>();

export const coinstats_selected_coin = writable<{
	price: number;
	priceChange: number;
	marketCap: number;
	volume: number;
	icon: string;
	symbol: string;
	name: string;
	color: string;
	slug: string;
}>();

export const coinstats_global_data = writable<{
	marketCap: number;
	volume: number;
	btcDominance: number;
	marketCapChange: number;
	volumeChange: number;
	btcDominanceChange: number;
}>();

export const cfgi_summary = writable<{
	now: {
		value: number;
		value_classification: CFGIEnum;
		timestamp: number;
	};
	previous: {
		value: number;
		value_classification: CFGIEnum;
		timestamp: number;
	};
	average: {
		value: number;
		value_classification: CFGIEnum;
		timestamp: number;
	};
} | null>(null);

export const coinstats_cfgi = writable<
	{
		value: number;
		value_classification: CFGIEnum;
		timestamp: number;
		time_until_update?: number;
	}[]
>();
export const coin_data = writable<ICoinCfgiPriceData[]>();
export const cfgi_period = writable<CFGI_SUPPORTED_PERIODS_ENUM>(CFGI_SUPPORTED_PERIODS_ENUM.DAY1);

export const coinstats_token_historical_price = writable<{ date: Date; price: number }[]>();
export const loading = writable<boolean>(false);
export const trend_chart_loading = writable<boolean>(true);
export const cfgi_chart_loading = writable<boolean>(false);
export const free_tokens = ['BTC', 'ETH'];
export const aped_score = writable<number>(0);
export const show_social_share = writable(false);
