import { PRIVATE_SUPABASE_SECRET } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { error, json, type RequestEvent } from '@sveltejs/kit';
import _ from 'lodash-es';

type Sentiment = {
	timestamp: Date; // Daily Timestamp at midnight today
	sentiment: number;
	user_id: string;
};

/** @type {import('./$types').RequestHandler} */
export async function GET({}: RequestEvent) {
	// Fetch Sentiment
	const supabase = createServerClient(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SECRET, {
		cookies: {}
	});

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const { data, error: read_err }: PostgrestSingleResponse<Sentiment[]> = await supabase
		.from('sentiment')
		.select()
		.eq('timestamp', today.toISOString());

	if (read_err) {
		return json({ sentiment: [] });
	}

	// Return the summary data
	return json({ sentiment: data });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }: RequestEvent) {
	const supabase = createServerClient(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SECRET, {
		cookies: {}
	});

	const data = await request.json();

	if (!data.sentiment || ![25, 50, 75].includes(data.sentiment) || !data.device_id) {
		return error(403, {
			message: 'Bad Request'
		});
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	await supabase
		.from('sentiment')
		.upsert([
			{
				timestamp: today.toISOString(),
				sentiment: data.sentiment,
				device_id: data.device_id
			}
		])
		.eq('device_id', data.device_id);

	// Delete Old Records
	await supabase.from('sentiment').delete().lt('timestamp', today.toISOString());

	return json({ message: 'Successfully Added the Sentiment' });
}
