import { PUBLIC_STRIPE_PRICES } from '$env/static/public';

const prices = PUBLIC_STRIPE_PRICES.split(',').map((p) => p.trim());
export const PREMIUM_PRICE_ID = prices[0];
export const DEGEN_PRICE_ID = prices[1];

export default prices;
