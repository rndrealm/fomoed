import { coinstats_coin_list } from '$lib/stores';
import type {
	ClientFetchStatus,
	NewsFilterVal,
	NewsItem,
	NewsKindVal,
	ServerResponse
} from '$ts/types';
import { derived, get, writable } from 'svelte/store';

export type NewsTokenOption = { value: string; label: string; icon: string | null };

const allTokensOption = { value: 'all', label: 'All crypto', icon: null };
export const newsTokenOpts = derived(
	coinstats_coin_list,
	(coinlist) => {
		if (!coinlist) {
			return [allTokensOption];
		}

		const tokens: NewsTokenOption[] = coinlist.map((coin) => {
			return { value: coin.symbol, label: coin.name, icon: coin.icon };
		});

		tokens.unshift(allTokensOption);

		return tokens;
	},
	[allTokensOption]
);

export type NewsFilterOption = { value: NewsFilterVal; label: string };

export const newsFilterOpts: NewsFilterOption[] = [
	{ value: 'all', label: 'Latest news' },
	{ value: 'rising', label: 'Rising' },
	{ value: 'hot', label: 'Hot' },
	{ value: 'bullish', label: 'Bullish' },
	{ value: 'bearish', label: 'Bearish' },
	{ value: 'important', label: 'Important' },
	// { value: 'saved', label: 'Saved' },
	{ value: 'lol', label: 'LOL' }
];

export type NewsKindOption = { value: NewsKindVal; label: string };

export const newsKindOpts: NewsKindOption[] = [
	{ value: 'all', label: 'News & Media' },
	{ value: 'news', label: 'News' },
	{ value: 'media', label: 'Media' }
];

interface FetchNewsOpts {
	currrency?: string;
	filter?: NewsFilterVal;
	kind?: NewsKindVal;
	page?: number;
	append?: boolean;
}

export class NewsService {
	news = writable<NewsItem[]>([]);
	status = writable<ClientFetchStatus>('idle');
	error = writable<string>('');
	hasNextPage = writable(true);

	#lastFetchOpts: FetchNewsOpts = {};
	#nextPage = 1;

	async fetchNews(opts: FetchNewsOpts = {}) {
		if (!opts.append) {
			this.news.set([]);
		}

		this.status.set('loading');

		const url = new URL(window.location.origin + '/api/news');

		url.searchParams.set('page', (opts.page ?? 1).toString());

		if (opts.currrency && opts.currrency !== 'all') {
			url.searchParams.set('currencies', opts.currrency);
		}

		if (opts.filter) {
			url.searchParams.set('filter', opts.filter);
		}

		if (opts.kind) {
			url.searchParams.set('kind', opts.kind);
		}

		const res = await fetch(url);

		if (!res.ok) {
			this.status.set('error');
			this.error.set(res.statusText);

			return;
		}

		const json = (await res.json()) as ServerResponse;

		if (!json.success) {
			this.status.set('error');
			this.error.set(json.message);

			return;
		}

		this.news.update((prev) => {
			return [...prev, ...json.data.results];
		});
		this.status.set('success');

		if (json.data.next === null) {
			this.hasNextPage.set(false);
		}

		this.#lastFetchOpts = opts;
	}

	async fetchNextPage() {
		if (get(this.status) === 'loading') {
			return;
		}

		this.#nextPage++;
		await this.fetchNews({ ...this.#lastFetchOpts, page: this.#nextPage, append: true });
	}

	reset() {
		this.news.set([]);
		this.#nextPage = 1;
	}
}
