import { json } from '@sveltejs/kit';
import stripe from '../stripe/stripe';
import type { RequestEvent } from './$types';
import type { PlanInfo } from '$lib/types';
import { PUBLIC_AVAILABLE_PRICE_IDS } from '$env/static/public';

const planInfos: PlanInfo[] = [
	{
		planIdPrefix: 'pro',
		name: 'PRO',
		recommended: true,
		features: [
			'Access to all widgets',
			'Access to more than 45 of the most popular crypto assets',
			'Access to Smart Signals',
			'Up to 10 saved dashboard layouts'
		]
	},
	{
		planIdPrefix: 'plus',
		name: 'Plus',
		recommended: false,
		features: [
			'Access to all widgets',
			'Access to more than 45 of the most popular crypto assets',
			'Up to 2 saved dashboard layouts'
		]
	}
];

// These are set in metadata of prices on stripe under the key 'plan_id'
// const plan_ids = ['pro_monthly', 'pro_yearly', 'plus_monthly', 'plus_yearly'];

export async function GET({ request }: RequestEvent) {
	const prices = await stripe.prices.list();
	const availablePriceIds = PUBLIC_AVAILABLE_PRICE_IDS.split(',');

	for (const price of prices.data) {
		// Skip prices that are not in the available price IDs list
		if (!availablePriceIds.includes(price.id)) {
			continue;
		}

		const planId = price.metadata.plan_id;

		if (!planId) {
			console.log(
				'No plan_id found for price, check stripe if plan_id is correctly set on price metadata in stripe.',
				price.id
			);
			continue;
		}

		const planInfo = planInfos.find((i) => planId.startsWith(i.planIdPrefix));

		if (!planInfo) {
			continue;
		}

		const priceUsd = (price.unit_amount || 0) / 100;

		if (price.recurring?.interval === 'month') {
			planInfo.priceIdMonth = price.id;
			planInfo.priceUsdMonth = priceUsd || 0;
			planInfo.productId = price.product as string;
		}

		if (price.recurring?.interval === 'year') {
			planInfo.priceIdYear = price.id;
			planInfo.priceUsdYear = priceUsd || 0;
			planInfo.productId = price.product as string;
		}
	}

	const data = {
		plans: planInfos
	};

	return json({ success: true, data });
}
