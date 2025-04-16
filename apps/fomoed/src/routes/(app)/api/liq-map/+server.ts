import { fetchCoinglassLiqMap, fetchPairMarkets } from '$ts/utils/server/coinglass';
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
	const instrumentId = url.searchParams.get('instrumentId');
	const baseAsset = url.searchParams.get('baseAsset');
	const quoteAsset = url.searchParams.get('quoteAsset');

	if (!timeframe) {
		return error(400, 'timeframe parameter must be specified!');
	}

	if (!exchange) {
		return error(400, 'exchange parameter must be specified!');
	}

	if (!instrumentId) {
		return error(400, 'instrumentId parameter must be specified!');
	}

	if (!baseAsset) {
		return error(400, 'instrumentId parameter must be specified!');
	}

	if (!quoteAsset) {
		return error(400, 'instrumentId parameter must be specified!');
	}

	const liquidationData = await fetchCoinglassLiqMap(timeframe, exchange, instrumentId);
	const pairMarketsData = await fetchPairMarkets(baseAsset);

	const pairMarketData = pairMarketsData.data.data.find(
		(i: any) => i.symbol === baseAsset + '/' + quoteAsset
	);

	if (liquidationData.success === false) {
		return error(500, { message: 'External server error: ' + liquidationData.msg });
	}

	return json({ data: { liquidationData, pairMarketData } });
}
