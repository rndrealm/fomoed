import { json, type RequestEvent, error } from '@sveltejs/kit';
import { PRIVATE_CFGI_KEY } from '$env/static/private';
import { CFGI_SUPPORTED_PERIODS_ENUM } from '$lib/utils/cfgi_data';

async function fetchCfgiData(token_symbol: string, period: number) {
	const endpoint = 'https://cfgi.io/api/api_request.php';
	const url = `${endpoint}?api_key=${PRIVATE_CFGI_KEY}&token=${token_symbol}&period=${period}&values=1`;

	const res = await fetch(url);

	console.log(res.status);

	if (res.status !== 200) {
		throw new Error(`Error fetching CFGI data: ${res.statusText}`);
	}

	const json = await res.json();

	return json;
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, locals: { supabase, user } }: RequestEvent) {
	const token_symbol = url.searchParams.get('symbol');

	if (!token_symbol) {
		return error(400, { message: 'Symbol parameter is required' });
	}

	// if (!user) {
	// 	return error(401, { message: 'Unauthorized' });
	// }

	const period = CFGI_SUPPORTED_PERIODS_ENUM.MIN15;

	let cfgiData: any;

	try {
		cfgiData = await fetchCfgiData(token_symbol, period);
	} catch (err) {
		return error(429);
	}

	return json({ success: true, data: cfgiData });
}
