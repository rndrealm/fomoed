import { PUBLIC_DASHBOARD_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';

const path = '/auth/update-password';

export function load() {
	throw redirect(302, PUBLIC_DASHBOARD_URL + path);
}
