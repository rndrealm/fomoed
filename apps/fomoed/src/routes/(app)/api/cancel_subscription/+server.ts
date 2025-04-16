import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from '../../../$types';
import stripe from '../stripe/stripe';

/** @type {import('./$types').RequestHandler} */
export async function POST({ locals: { supabase, user }, request }: RequestEvent) {
	if (!user) {
		return error(401, 'Unauthorized Request');
	}

	console.info('Cancelling subscription for user', user.id);

	try {
		const body = await request.json();
		const sub = body.subscription;
		await stripe.subscriptions.update(sub.toString(), { cancel_at_period_end: true });

		return json({ subscription: sub });
	} catch (err: any) {
		console.error('Failed to cancel subscription', err);
		return error(500, `Failed to cancel subscription: ${err.message || err.toString()}`);
	}
}
