import { error, json, type RequestEvent } from '@sveltejs/kit';
import stripe from '../stripe';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';

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

	try {
		const session = await stripe.checkout.sessions.create({
			mode: 'subscription',
			payment_method_types: ['card'],
			line_items: [
				{
					price: priceId,
					quantity: 1
				}
			],
			success_url: `${url.protocol}//${url.host}?sessionId={CHECKOUT_SESSION_ID}`,
			cancel_url: `${url.protocol}//${url.host}/`,
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
							trial_period_days: 30
						}),
				metadata: {
					user_id: formData.user_id
				}
			}
		});

		return json({
			sessionId: session.id,
			url: session.url
		});
	} catch (err: any) {
		return error(500, {
			message: err?.message || err.toString()
		});
	}
}
