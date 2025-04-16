import { json, type RequestEvent } from '@sveltejs/kit';
import stripe from '../stripe';
import prices from '$lib/prices';

/** @type {import('./$types').RequestHandler} */
export async function GET(event: RequestEvent) {
	const stripe_prices = await Promise.all(
		prices.map((priceId) => {
			return stripe.prices.retrieve(priceId);
		})
	);

	stripe_prices.unshift({
		id: 'free',
		object: 'price',
		active: true,
		billing_scheme: 'per_unit',
		created: Date.now(),
		currency: 'usd',
		custom_unit_amount: null,
		livemode: false,
		lookup_key: null,
		metadata: {},
		nickname: null,
		product: 'prod_Q0UdBXaEHet6me',
		recurring: {
			aggregate_usage: null,
			interval: 'month',
			interval_count: 1,
			meter: null,
			trial_period_days: null,
			usage_type: 'licensed'
		},
		tax_behavior: 'unspecified',
		tiers_mode: null,
		transform_quantity: null,
		type: 'recurring',
		unit_amount: 0,
		unit_amount_decimal: '0'
	} as any);

	return json({
		prices: stripe_prices
			.map((price) => ({
				...price,
				name:
					price.id === 'free'
						? 'Basic'
						: price.recurring?.interval === 'year'
							? 'Degen'
							: 'Premium',
				features:
					price.id !== 'free'
						? [
								'Access to 15M, 1H, and 4H Data',
								'Access to more than 45 of the most popular crypto assets'
							]
						: ['Access to Daily Data', 'Access to BTC and ETH']
			}))
			.filter((price) => {
				return price.active;
			})
	});
}
