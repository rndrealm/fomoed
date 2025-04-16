import { PRIVATE_SUPABASE_SECRET } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import {
	fetchAssetPriceUsd,
	fetchCoinglassLiqMap,
	fetchCoinglassSupportedPairs
} from '$ts/utils/server/coinglass';
import { getActiveSubPlanName, hasActiveSubscription } from '$ts/utils/server/subscription';
import { createServerClient } from '@supabase/ssr';
import { type RequestEvent, error, json } from '@sveltejs/kit';
import { now } from 'lodash-es';

const maxCacheAgeSeconds = 120;

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, locals: { user, supabase } }: RequestEvent) {
	if (!user) {
		return error(401, { message: 'Unauthorized' });
	}

	// if ((await getActiveSubPlanName(supabase, user.id)) !== 'plus') {
	// 	return error(401, { message: 'Unauthorized' });
	// }

	const supabaseServer = createServerClient(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SECRET, {
		cookies: {}
	});

	const url = new URL(request.url);
	const timeframe = url.searchParams.get('timeframe');
	const asset = url.searchParams.get('asset');

	if (!timeframe) {
		return error(400, 'timeframe parameter must be specified!');
	}

	if (!asset) {
		return error(400, 'asset parameter must be specified!');
	}

	const currentPriceUsd = await fetchAssetPriceUsd(asset);

	// Load cached data
	const cacheAssetId = asset + '-' + timeframe;
	const cached = await supabaseServer
		.from('exchangeLiqMapCache')
		.select()
		.eq('asset', cacheAssetId);

	if (cached.data?.length) {
		const row = cached.data[0];
		const updatedAt = new Date(row.updated_at);
		const ageSeconds = (now() - updatedAt.getTime()) / 1000;

		if (ageSeconds < maxCacheAgeSeconds) {
			return json({ success: true, data: { currentPriceUsd, exLiqData: cached.data[0].data } });
		}
	}

	const supportedFuturePairs: Record<string, { baseAsset: string; instrumentId: string }[]> = (
		await fetchCoinglassSupportedPairs()
	).data;

	if (!supportedFuturePairs) {
		return error(500);
	}

	const aggregatedExchanges = ['Binance', 'OKX', 'Bybit'];

	type ExName = string;
	type TotalExLiqMap = Record<number, number>;

	const totalExLiq: Record<ExName, TotalExLiqMap> = {};

	// Kep only Binance, OKX, Bybit
	for (const exchange of Object.keys(supportedFuturePairs)) {
		if (!aggregatedExchanges.includes(exchange)) {
			delete supportedFuturePairs[exchange];
		} else {
			totalExLiq[exchange] = {};
		}
	}

	// Keep only instruments with requested asset
	for (const [exchange, instruments] of Object.entries(supportedFuturePairs)) {
		supportedFuturePairs[exchange] = instruments.filter((i) => i.baseAsset === asset);
	}

	type CgLiquidationMapData = Record<number, [number, number, number, null][]>;

	for (const [exchange, instruments] of Object.entries(supportedFuturePairs)) {
		for (const instrument of instruments) {
			console.info(
				'[Exchange Liquidation Map API] Fetching instrument:',
				exchange,
				instrument.instrumentId
			);

			const liquidationData: CgLiquidationMapData = (
				await fetchCoinglassLiqMap(timeframe, exchange, instrument.instrumentId)
			)?.data?.data;

			// Sometimes data is not returned
			if (!liquidationData) {
				continue;
			}

			for (const [price, liquidations] of Object.entries(liquidationData)) {
				const roundedPrice = parseInt(price);

				for (const liquidation of liquidations) {
					const liqLevel = liquidation[1];

					totalExLiq[exchange][roundedPrice] = (totalExLiq[exchange][roundedPrice] || 0) + liqLevel;
				}
			}
		}
	}

	// Cache retrieved data
	await supabaseServer
		.from('exchangeLiqMapCache')
		.upsert({ asset: cacheAssetId, data: totalExLiq });

	return json({ success: true, data: { currentPriceUsd, exLiqData: totalExLiq } });
}
