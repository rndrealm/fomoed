import { PUBLIC_DASHBOARD_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';

export function load() {
	redirect(307, PUBLIC_DASHBOARD_URL);
}
