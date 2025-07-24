import { PUBLIC_DASHBOARD_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';

const path = '/auth/callback';

export function load({ url }) {
	const queryParams = url.search;
	throw redirect(302, `${PUBLIC_DASHBOARD_URL}/${path}${queryParams}`);
}
