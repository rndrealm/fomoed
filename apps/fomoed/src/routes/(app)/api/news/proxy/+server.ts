import { NewsService } from '$ts/server/services/NewsService.server.js';
import { error, json } from '@sveltejs/kit';

export async function GET({ url, fetch }) {
	const targetUrl = url.searchParams.get('url');

	if (!targetUrl) {
		throw error(400, 'Missing url parameter');
	}

	new URL(targetUrl);

	const parsedArticle = await NewsService.getContentFromUrl(targetUrl);

	return json({ success: true, data: parsedArticle });
}
