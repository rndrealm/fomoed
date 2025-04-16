import { PRIVATE_STRIPE_SECRET_KEY } from '$env/static/private';
import Stripe from 'stripe';

const stripe = new Stripe(PRIVATE_STRIPE_SECRET_KEY, {
	apiVersion: '2024-04-10'
});

export default stripe;
