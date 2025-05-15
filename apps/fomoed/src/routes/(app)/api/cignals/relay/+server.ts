import { PRIVATE_CIGNALS_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (req) => {
	const url = req.url;
	const pathBase64 = url.searchParams.get('path');

	if (!pathBase64) {
		return new Response('Missing required parameter <path>', { status: 400 });
	}

	const path = atob(pathBase64);
	const apiKey = PRIVATE_CIGNALS_KEY;

	const cignalsUrl = new URL(path);

	const res = await fetch(cignalsUrl.toString(), {
		method: 'GET',
		headers: {
			Authorization: apiKey
		}
	});

	const text = await res.text();

	console.log(path);

	return new Response(text, {
		status: res.status,
		headers: {
			'Content-Type': 'application/json'
		}
	});
};
