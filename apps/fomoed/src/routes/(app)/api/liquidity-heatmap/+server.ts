import { fetchCoinglassHeatmap } from '$ts/utils/server/coinglass';
import { getActiveSubPlanName } from '$ts/utils/server/subscription';
import { json, type RequestEvent, error } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, locals: { supabase, user } }: RequestEvent) {
	if (!user) {
		return error(401, { message: 'Unauthorized' });
	}

	// if ((await getActiveSubPlanName(supabase, user.id)) !== 'plus') {
	// 	return error(401, { message: 'Unauthorized' });
	// }

	const url = new URL(request.url);
	const timeframe = url.searchParams.get('timeframe');
	const exchange = url.searchParams.get('exchange');
	const symbol = url.searchParams.get('symbol');

	if (!timeframe) {
		return error(400, 'timeframe parameter must be specified!');
	}

	if (!exchange) {
		return error(400, 'exchange parameter must be specified!');
	}

	if (!symbol) {
		return error(400, 'symbol parameter must be specified!');
	}

	console.log({ timeframe, exchange, symbol });

	const data = await fetchCoinglassHeatmap(timeframe, exchange, symbol);

	return json({ data: data.data });
}
