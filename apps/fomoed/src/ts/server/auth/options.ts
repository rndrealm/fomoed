import { dev } from '$app/environment';
import type { CookieOptionsWithName } from '@supabase/ssr';

export const supabaseCookieOpts: CookieOptionsWithName = {
	domain: dev ? undefined : '.fomoed.io',
	path: '/',
	sameSite: 'lax',
	secure: true,
	maxAge: 60 * 60 * 24 * 30 // 30 days
};
