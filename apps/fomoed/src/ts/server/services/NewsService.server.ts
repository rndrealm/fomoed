import { PRIVATE_CRYPTOPANIC_KEY } from '$env/static/private';
import type { ParsedArticle } from '$ts/common/types';
import type { NewsFilterVal, NewsKindVal } from '$ts/types';
import { NewsTable, type NewsRowInsert } from '../db/NewsTable';
import type { CryptopanicNewsApiResponse } from '$ts/server/types/api/cryptopanicNews';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import type { NewsFeedResponseData } from '$ts/common/api.types';
import { PUBLIC_NEWSLAB_URL } from '$env/static/public';

type ApiNewsLabPost = {
	id: string;
	title: string;
	content: string;
	created_at: string;
	metadata: {
		ref_tokens: string[];
	};
};

export class NewsService {
	/**
	 * @deprecated Use fetchNewsV2 instead
	 */
	async getFromCryptoPanic({
		filter = 'all',
		kind = 'all',
		currencies = null,
		page = 1
	}: {
		filter: NewsFilterVal;
		kind: NewsKindVal;
		currencies: string | null;
		page: number;
	}) {
		const url = new URL('https://cryptopanic.com/api/posts/');

		url.searchParams.set('auth_token', PRIVATE_CRYPTOPANIC_KEY);
		url.searchParams.set('metadata', 'true');
		url.searchParams.set('approved', 'true');

		if (filter !== 'all') {
			url.searchParams.set('filter', filter);
		}

		if (kind !== 'all') {
			url.searchParams.set('kind', kind);
		}

		if (currencies) {
			url.searchParams.set('currencies', currencies);
		}

		url.searchParams.set('page', page.toString());

		const res = await fetch(url);

		if (!res.ok) {
			console.error(await res.text());
			throw new Error('Failed to fetch news from CryptoPanic');
		}

		const json: CryptopanicNewsApiResponse = await res.json();

		return json;
	}

	async fetchRowsFromNewsLab(): Promise<Partial<NewsRowInsert>[]> {
		console.log('Fetching newslab posts');

		const newsRows: Partial<NewsRowInsert>[] = [];

		const url = new URL('/api/newslab-posts', PUBLIC_NEWSLAB_URL);

		let res: Response;

		try {
			res = await fetch(url);
		} catch (error) {
			console.error('Failed to fetch newslab posts:', error);
			return [];
		}

		let json: ApiNewsLabPost[];

		try {
			json = await res.json();
		} catch (error) {
			console.error('Failed to parse newslab posts:', error);
			return [];
		}

		for (const post of json) {
			const originalUrl = PUBLIC_NEWSLAB_URL + '/api/newslab-posts/' + post.id;

			const contentWithoutTitle = post.content.replace(/<h1[^>]*>.*?<\/h1>/, '');
			const contentWithoutMarkup = contentWithoutTitle.replace(/<[^>]+>/g, '');
			const contentWithoutNewlines = contentWithoutMarkup.replace(/\n/g, ' ').trim();
			const briefContent = contentWithoutNewlines.substring(0, 200) + '...';

			const rowInsert: Partial<NewsRowInsert> = {
				id: post.id,
				original_url: originalUrl,
				published_at: post.created_at,
				source: 'NewsLab',
				image_url: null,
				sentiment: 'neutral',
				summary: briefContent,
				symbols: post.metadata.ref_tokens,
				title: post.title
			};

			newsRows.push(rowInsert);
		}

		return newsRows;
	}

	async fetchNewsV2({
		filter = 'all',
		kind = 'all',
		currencies = null,
		page = 1,
		search = ''
	}: {
		filter: NewsFilterVal;
		kind: NewsKindVal;
		currencies: string | null;
		page: number;
		search: string;
	}): Promise<NewsFeedResponseData> {
		const url = new URL('https://cryptopanic.com/api/posts/');

		url.searchParams.set('auth_token', PRIVATE_CRYPTOPANIC_KEY);
		url.searchParams.set('metadata', 'true');
		url.searchParams.set('approved', 'true');

		if (filter !== 'all') {
			url.searchParams.set('filter', filter);
		}

		if (kind !== 'all') {
			url.searchParams.set('kind', kind);
		}

		if (currencies) {
			url.searchParams.set('currencies', currencies);
		}

		url.searchParams.set('page', page.toString());

		const res = await fetch(url);

		if (!res.ok) {
			console.error(await res.text());
			throw new Error('Failed to fetch news from CryptoPanic');
		}

		const json: CryptopanicNewsApiResponse = await res.json();
		const news = json.results;

		const newsRows: Partial<NewsRowInsert>[] = [];
		const ids: string[] = [];

		for (const i of news) {
			const appId = `cryptopanic-${i.id}`;

			newsRows.push({
				id: appId,
				original_url: i.source.url,
				published_at: i.published_at,
				source: i.source.title,
				image_url: null,
				sentiment:
					i.votes.positive > i.votes.negative
						? 'bullish'
						: i.votes.positive < i.votes.negative
							? 'bearish'
							: 'neutral',
				summary: i.metadata?.description,
				symbols: i.currencies?.map((c) => c.code) || [],
				title: i.title
			});

			ids.push(appId);
		}

		// Append news from newslab from
		const newsLabPosts = await this.fetchRowsFromNewsLab();

		const concatPostUpserts = [...newsRows, ...newsLabPosts];

		// Filter posts based on search term if provided
		const filteredPosts = search.trim()
			? concatPostUpserts.filter(
					(post) =>
						post.title?.toLowerCase().includes(search.toLowerCase()) ||
						post.summary?.toLowerCase().includes(search.toLowerCase()) ||
						post.symbols?.some((symbol) => symbol.toLowerCase().includes(search.toLowerCase()))
				)
			: concatPostUpserts;

		// console.log(filteredPosts);

		// Update the IDs in the response to match filtered results
		const filteredIds = filteredPosts
			.filter((post) => ids.includes(post.id as string))
			.map((post) => post.id as string);

		await NewsTable.upsert(filteredPosts);

		const responseData: NewsFeedResponseData = {
			count: filteredIds.length,
			next: json.next, // Don't use pagination with search
			previous: json.previous,
			postIds: filteredIds
			// count: json.count,
			// next: json.next,
			// previous: json.previous,
			// postIds: ids
		};

		return responseData;
	}

	static async getContentFromUrl(url: string): Promise<ParsedArticle> {
		if (url.startsWith('https://cryptopanic.com/news/external/')) {
			const res = await fetch(url);

			if (res.redirected) {
				url = res.url;
			}
		}

		let response;

		try {
			// Fetch HTML content from the URL
			response = await fetch(url);
		} catch (error) {
			console.error('Error fetching article content:', error);
			throw error;
		}

		if (!response.ok) {
			throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
		}

		const html = await response.text();

		// Parse HTML using JSDOM
		const dom = new JSDOM(html, { url });

		// Use Readability to extract the main content
		const reader = new Readability(dom.window.document);
		const article = reader.parse();

		if (!article) {
			throw new Error('Failed to parse article content');
		}

		const parsedArticle: ParsedArticle = {
			htmlContent: article.content,
			author: { name: article.byline || null }
		};

		return parsedArticle;
	}
}
