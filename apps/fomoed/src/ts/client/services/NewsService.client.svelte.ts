import { coinstats_coin_list } from '$lib/stores';
import type { NewsFilterVal, NewsItem, NewsKindVal } from '$ts/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { derived, writable } from 'svelte/store';
import { getArticleDetailHref } from '../utils/ui';
import type { ParsedArticle } from '$ts/common/types';
import type { NewsFeedResponseData, TypedServerResponse } from '$ts/common/api.types';
import { BaseService } from './BaseService.client.svelte';
import type { NewsRow } from '$ts/server/db/NewsTable';

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
	{ value: 'all', label: 'All' },
	{ value: 'rising', label: 'Rising' },
	{ value: 'hot', label: 'Hot' },
	{ value: 'bullish', label: 'Bullish' },
	{ value: 'bearish', label: 'Bearish' },
	{ value: 'important', label: 'Important' },
	{ value: 'saved', label: 'Top Saved' },
	{ value: 'lol', label: 'LOL' }
];

export type NewsKindOption = { value: NewsKindVal; label: string };

export const newsKindOpts: NewsKindOption[] = [
	{ value: 'all', label: 'News & Media' },
	{ value: 'news', label: 'News' },
	{ value: 'media', label: 'Media' }
];

interface NewsLikesMixin {
	// This contains only the likes on the post of the current user
	// -- zero or one items
	news_likes: { id: number }[];
}

interface NewsBookmarksMixin {
	// This contains only the bookmarks on the post of the current user
	// -- zero or one items
	news_bookmarks: { id: number }[];
}

export type AppNewsItem = {
	detailUrl: string;
	userLiked: boolean;
	userBookmarked: boolean;
} & NewsRow &
	NewsLikesMixin &
	NewsBookmarksMixin;

export class NewsService extends BaseService {
	news = $state<AppNewsItem[]>([]);
	popularNews = $state<AppNewsItem[]>([]);

	hasNextPage = writable(true);
	currentPage = $state(1);
	totalPages = $state(1);
	isFetching = $state(false);

	filter: NewsFilterVal;
	#kind: NewsKindVal;
	#page: number;

	constructor() {
		super();

		this.filter = 'all';
		this.#kind = 'news';
		this.#page = 1;
	}

	#transformNewsItem(item: NewsRow & NewsLikesMixin & NewsBookmarksMixin): AppNewsItem {
		let detailUrl: string;

		if (item.source.toLowerCase().includes('twitter')) {
			detailUrl = item.original_url;
		} else {
			detailUrl = getArticleDetailHref(item.original_url);
		}

		const appNewsItem: AppNewsItem = {
			...item,
			detailUrl,
			userLiked: item.news_likes?.length > 0,
			userBookmarked: item.news_bookmarks?.length > 0
		};

		return appNewsItem;
	}

	async fetchNews() {
		this.isFetching = true;

		const url = new URL(window.location.origin + '/api/news/v2');

		url.searchParams.set('page', this.#page.toString());
		url.searchParams.set('filter', this.filter);
		url.searchParams.set('kind', this.#kind);
		// url.searchParams.set('currencies', this.#currency);

		const res = await fetch(url);

		if (!res.ok) {
			this.isFetching = false;
			return;
		}

		const json = (await res.json()) as TypedServerResponse<NewsFeedResponseData>;

		if (!json.success) {
			this.isFetching = false;
			return;
		}

		// Now we need to fetch the posts from the DB
		const postIds = json.data.postIds;

		const { data, error } = await this.supabase
			.from('news')
			.select('*, news_likes(id), news_bookmarks(id)')
			.in('id', postIds);

		if (error) {
			this.isFetching = false;
			return;
		}

		this.news = data.map(this.#transformNewsItem);

		this.currentPage = this.#page;

		// Calculate total pages if possible based on API response
		// Assuming the API provides total count or pages information
		// If not provided, we'll estimate based on hasNextPage
		if (json.data.count !== undefined) {
			const itemsPerPage = json.data.postIds.length || 10;
			this.totalPages = Math.ceil(json.data.count / itemsPerPage);
		} else {
			// If we don't have exact count, estimate based on current situation
			this.totalPages = this.hasNextPage ? this.currentPage + 1 : this.currentPage;
		}

		if (json.data.next === null) {
			this.hasNextPage.set(false);
		} else {
			this.hasNextPage.set(true);
			this.isFetching = false;
		}
	}

	async fetchPopularNews(): Promise<boolean> {
		const dayAgo = new Date(new Date().valueOf() - 24 * 60 * 60 * 1000);

		const { data, error } = await this.supabase
			.from('news')
			.select('*, news_likes(id), news_bookmarks(id)')
			.gte('published_at', dayAgo.toISOString())
			.order('likes_count', { ascending: false })
			.limit(3);

		if (error) {
			console.error('Error fetching popular news:', error);

			this.popularNews = [];
			return false;
		}

		this.popularNews = data.map(this.#transformNewsItem);

		return true;
	}

	async getArticleByOriginalUrl(
		supabase: SupabaseClient,
		originalUrl: string
	): Promise<AppNewsItem | null> {
		// Check if article is already in the news array
		const existingArticle = this.news.find((item) => item.original_url === originalUrl);

		if (existingArticle) {
			return existingArticle;
		}

		// If not found, we will have to load from DB
		// First, decode the base64 encoded URL
		const decodedUrl = decodeURIComponent(originalUrl);

		// Get article from DB
		const { data, error } = await supabase
			.from('news')
			.select('*')
			.eq('original_url', decodedUrl)
			.single();

		if (error) {
			return null;
		}

		const appNewsItem = this.#transformNewsItem(data);

		return appNewsItem;
	}

	async getParsedArticleUsingProxy(originalUrl: string): Promise<ParsedArticle | null> {
		let response: Response;

		try {
			response = await fetch(`/api/news/proxy?url=${encodeURIComponent(originalUrl)}`);
		} catch (error) {
			return null;
		}

		const jsonData = (await response.json()) as TypedServerResponse<ParsedArticle>;

		if (!response.ok || !jsonData.success) {
			return null;
		}

		return jsonData.data;
	}

	async nextPage() {
		this.#page += 1;
		await this.fetchNews();
	}

	async previousPage() {
		if (this.#page > 1) {
			this.#page -= 1;
			await this.fetchNews();
		}
	}

	async setPage(page: number) {
		if (page >= 1) {
			this.#page = page;
			await this.fetchNews();
		}
	}

	reset() {
		this.news = [];
		this.currentPage = 1;
		this.#page = 1;
	}
}

export const newsService = new NewsService();
