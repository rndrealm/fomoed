import { toast } from '@zerodevx/svelte-toast';
import type { ICoinCfgiPriceData, TCoinStatsCoin } from '$lib';
import {
	cfgi_chart_loading,
	cfgi_period,
	cfgi_summary,
	coin_data,
	coinstats_coin_list,
	coinstats_global_data,
	coinstats_selected_coin,
	trend_chart_loading
} from '$lib/stores';
import { CFGI_SUPPORTED_PERIODS_ENUM } from './cfgi_data';
import { memoizeDebounce } from './memoizeDebounce';
import { meanBy } from 'lodash-es';
import { get } from 'svelte/store';

export function get_data_index(data: number) {
	return Math.floor(data / 25);
}

export function get_data_color(data: number) {
	return data <= 25 ? '#FF3B10' : data <= 50 ? '#EA9924' : data <= 75 ? '#399F57' : '#05A5A6';
}

export function get_data_label(data: number) {
	return data <= 25
		? CFGIEnum.E_FEAR
		: data <= 50
			? CFGIEnum.FEAR
			: data <= 75
				? CFGIEnum.GREED
				: CFGIEnum.E_GREED;
}

export enum CFGIEnum {
	E_FEAR = 'Extreme Fear',
	FEAR = 'Fear',
	GREED = 'Greed',
	E_GREED = 'Extreme Greed'
}

const toast_handler = (msg: string | any, opts?: any | undefined) => {
	const id = toast.push(msg, opts);

	setTimeout(() => {
		toast.pop(id);
	}, 3000);

	return id;
};

export const success = (m: string) =>
	toast_handler(m, {
		theme: {
			'--toastBackground': 'green',
			'--toastColor': 'white',
			'--toastBarBackground': 'olive'
		}
	});

export const warning = (m: string) =>
	toast_handler(m, {
		theme: {
			'--toastBackground': 'orange',
			'--toastColor': 'white',
			'--toastBarBackground': '#ff9900'
		}
	});

export const failure = (m: string) =>
	toast_handler(m, {
		theme: {
			'--toastBackground': '#cc0033',
			'--toastColor': 'white',
			'--toastBarBackground': '#ff3300'
		}
	});

export type SocialSites = 'facebook' | 'twitter' | 'telegram' | 'copy';

export function copy_social_link(platform: SocialSites, link: string) {
	let social_link = link;

	switch (platform) {
		case 'facebook':
			social_link = `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: link }).toString().trim()}`;
			break;
		case 'twitter':
			social_link = `https://twitter.com/intent/tweet?${new URLSearchParams({ text: link }).toString().trim()}`;
			break;
		case 'telegram':
			social_link = `https://t.me/share/url?${new URLSearchParams({ url: link }).toString().trim()}`;
			break;
		default:
			social_link = link;
			break;
	}

	return social_link.trim();
}

export async function refresh_coinstats_coin_list() {
	const coins = await fetch('https://api.coin-stats.com/v4/coins?skip=0&limit=2500')
		.then((res) => res.json())
		.then((res) => (res?.coins as TCoinStatsCoin[]) || [])
		.catch((err) => {
			console.error(err);

			return [];
		});

	coinstats_coin_list.set(
		coins.map((coin) => {
			return {
				price: coin.pu,
				priceChange: coin.p24,
				marketCap: coin.m,
				volume: coin.v,
				icon: coin.ic,
				symbol: coin.s,
				name: coin.n,
				color: coin.c,
				slug: coin.i,
				is_free: coin.i === 'bitcoin' || coin.i === 'ethereum'
			};
		})
	);
}

export async function fetch_global_data() {
	const global_data = await fetch('https://api.coin-stats.com/v2/markets/global')
		.then((res) => res.json())
		.then(
			(res) =>
				res as {
					globalData: {
						marketCap: number;
						volume: number;
						btcDominance: number;
						marketCapChange: number;
						volumeChange: number;
						btcDominanceChange: number;
					};
				}
		)
		.catch(() => null);

	if (global_data?.globalData) {
		coinstats_global_data.set(global_data?.globalData);
	}

	return global_data;
}

export async function fetch_token_data(
	token_symbol: string,
	token_slug: string,
	period: CFGI_SUPPORTED_PERIODS_ENUM,
	token_name: string
) {
	cfgi_chart_loading.set(true);
	trend_chart_loading.set(true);
	const data = await fetch(`/api/cfgi`, {
		method: 'POST',
		body: JSON.stringify({
			token_symbol,
			token_name,
			token_slug,
			period
		})
	})
		.then((res) => res.json())
		.then((res) => res.data as ICoinCfgiPriceData[])
		.catch((err) => {
			console.error(err);

			return [];
		});
	trend_chart_loading.set(false);
	if (data?.length > 0) {
		coin_data.set(data);
		await fear_and_greed_index_summary(data);
	}
}

async function fear_and_greed_index_summary(data: ICoinCfgiPriceData[]) {
	if (!data?.length) return;

	let now: {
		value: number;
		value_classification: CFGIEnum;
		timestamp: number;
		// time_until_update: number;
	} | null = null;

	let previous: {
		value: number;
		value_classification: CFGIEnum;
		timestamp: number;
		// time_until_update: number;
	} | null = null;

	// Recent
	const last_element = data[data.length - 1];
	const previous_element = data[data.length - 2];

	if (!last_element || !previous_element) {
		cfgi_summary.set(null);
		return;
	}

	if (last_element) {
		now = {
			value: last_element.cfgi,
			value_classification: get_data_label(last_element.cfgi),
			timestamp: last_element.date
			// time_until_update: 0
		};
	}

	if (previous_element) {
		previous = {
			value: last_element.cfgi,
			value_classification: get_data_label(last_element.cfgi),
			timestamp: last_element.date
			// time_until_update: 0
		};
	}

	const average_cfgi = parseInt(meanBy(data, 'cfgi').toFixed(0));

	const average_element = isFinite(average_cfgi)
		? {
				value: average_cfgi,
				value_classification: get_data_label(average_cfgi),
				timestamp: Date.now()
				// time_until_update: 0
			}
		: null;

	if (now && previous && average_element)
		cfgi_summary.set({ now, previous, average: average_element });
}

const memoizedTokenData = memoizeDebounce(fetch_token_data, 0, { maxWait: 2000 });

export async function get_token_data(
	token_symbol: string,
	token_slug: string,
	period: CFGI_SUPPORTED_PERIODS_ENUM,
	token_name: string
) {
	await memoizedTokenData(token_symbol, token_slug, period, token_name);
}

coinstats_coin_list.subscribe((coins) => {
	if (coins?.length) {
		coinstats_selected_coin.set(coins[0]);
	}
});

coinstats_selected_coin.subscribe(async (coin) => {
	if (coin) {
		if (get(coin_data) && get(coin_data)[0].symbol === coin.symbol) {
			return;
		}

		await get_token_data(
			coin.symbol,
			coin.slug,
			+get(cfgi_period) || CFGI_SUPPORTED_PERIODS_ENUM.MIN15,
			coin.name
		);
	}
});

coinstats_selected_coin.subscribe(async (coin) => {
	await fetch_global_data();
});

cfgi_period.subscribe(async (period) => {
	const $coinstats_selected_coin = get(coinstats_selected_coin);

	if (+period) {
		if ((get(coin_data) && get(coin_data)[0].period === period) || !$coinstats_selected_coin) {
			return;
		}

		await get_token_data(
			$coinstats_selected_coin.symbol,
			$coinstats_selected_coin.slug,
			period,
			$coinstats_selected_coin.name
		);
	}
});
