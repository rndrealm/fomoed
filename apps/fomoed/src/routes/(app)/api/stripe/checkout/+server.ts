import { error, json, type RequestEvent } from '@sveltejs/kit';
import stripe from '../stripe';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';

const TRIAL_PERIOD_DAYS = 7;

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, url, locals: { user, supabase } }: RequestEvent) {
	const req = request;

	const formData = await req.json();
	const priceId = formData.priceId;

	if (typeof priceId !== 'string') {
		return error(400, {
			message: 'Invalid Price ID'
		});
	}

	if (!user?.email) {
		return error(403, {
			message: 'Unauthorized. Please login before proceeding'
		});
	}

	// Make sure only one free trial is allowed
	const { data: users, error: err }: PostgrestSingleResponse<IUser[]> = await supabase
		.from('users')
		.select()
		.eq('email', user.email);

	if (!users?.[0]) {
		return error(403, {
			message: 'Unauthorized. Please login before proceeding'
		});
	}

	let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>;

	try {
		session = await stripe.checkout.sessions.create({
			mode: 'subscription',
			payment_method_types: ['card'],
			line_items: [
				{
					price: priceId,
					quantity: 1
				}
			],
			success_url: `${url.protocol}//${url.host}?sessionId={CHECKOUT_SESSION_ID}`,
			cancel_url: `${url.protocol}//${url.host}/subscription/fail`,
			customer_email: formData.email,
			metadata: {
				user_id: formData.user_id
			},
			subscription_data: {
				...(users[0]?.has_had_free_trial
					? {}
					: {
							trial_settings: {
								end_behavior: {
									missing_payment_method: 'cancel'
								}
							},
							trial_period_days: TRIAL_PERIOD_DAYS
						}),
				metadata: {
					user_id: formData.user_id
				}
			}
		});
	} catch (err: any) {
		return error(500, {
			message: err?.message || err.toString()
		});
	}

	if (!session) {
		return error(500, {
			message: 'Failed to create Stripe session'
		});
	}

	return json({
		sessionId: session.id,
		url: session.url
	});
}
