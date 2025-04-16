import { fetchCoinglassSupportedPairs } from '$ts/utils/server/coinglass';
import { hasActiveSubscription } from '$ts/utils/server/subscription';
import { json, type RequestEvent, error } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, locals: { supabase, user } }: RequestEvent) {
	if (!user) {
		return error(401, { message: 'Unauthorized' });
	}

	if (!hasActiveSubscription(supabase, user.id)) {
		return error(401, { message: 'Unauthorized' });
	}

	const data = await fetchCoinglassSupportedPairs();

	return json({ data: data.data });
}
