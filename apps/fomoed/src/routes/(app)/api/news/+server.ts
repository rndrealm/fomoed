import { json } from '@sveltejs/kit';
import { NewsService } from '$ts/server/services/NewsService.server';
import { newsFilterVals, newsKindVals } from '$ts/types.js';
import type { NewsFeedResponseData } from '$ts/common/api.types.js';

const newsService = new NewsService();

export async function GET({ request }) {
	const url = new URL(request.url);

	const filter = url.searchParams.get('filter') as any;
	const kind = url.searchParams.get('kind') as any;
	const page = url.searchParams.get('page') as any;
	const currencies = url.searchParams.get('currencies') as any;

	if (!newsFilterVals.includes(filter)) {
		return json({ success: false, message: 'Invalid filter parameter value' });
	}

	if (!newsKindVals.includes(kind as any)) {
		return json({ success: false, message: 'Invalid kind parameter value' });
	}

	if (!Number.isInteger(+page)) {
		return json({ success: false, message: 'Invalid page parameter value' });
	}

	const data = await newsService.getFromCryptoPanic({ filter, kind, page, currencies });

	return json({ success: true, data });
}
