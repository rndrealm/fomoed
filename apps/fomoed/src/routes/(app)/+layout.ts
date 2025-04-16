import { createBrowserClient, createServerClient, isBrowser, parse } from '@supabase/ssr';
import type { LayoutLoad } from './$types';

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON } from '$env/static/public';
import type { SetOptional } from 'type-fest';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { goto } from '$app/navigation';
import { failure, success } from '$lib/utils';
import { getContext } from 'svelte';

export const load: LayoutLoad = async ({ depends, fetch, data, url }) => {
	/**
	 * Declare a dependency so the layout can be invalidated, for example, on
	 * session refresh.
	 */
	depends('supabase:auth');

	// console.log(PUBLIC_SUPABASE_ANON, PUBLIC_SUPABASE_URL);

	// ! Always created using the ANON key
	const supabase = isBrowser()
		? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON, {
				global: {
					fetch
				},
				cookies: {
					get(key) {
						const cookie = parse(document.cookie);
						return cookie[key];
					}
				}
			})
		: createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON, {
				global: {
					fetch
				},
				cookies: {
					get() {
						if (data.session) {
							delete data.session.user;
						}

						return JSON.stringify(data.session);
					}
				}
			});

	/**
	 * It's fine to use `getSession` here, because on the client, `getSession` is
	 * safe, and on the server, it reads `session` from the `LayoutData`, which
	 * safely checked the session using `safeGetSession`.
	 */
	const {
		data: { session }
	} = await supabase.auth.getSession();

	if (!isBrowser()) {
		if (session) {
			delete (session as SetOptional<Session, 'user'>).user;
		}
	}

	const {
		data: { user }
	} = await supabase.auth.getUser();

	async function signInWithTokenHash(token_hash: string) {
		const { data, error } = await supabase.auth.verifyOtp({
			token_hash: token_hash,
			type: 'recovery'
		});

		if (error) {
			console.error(error);
			failure(error.message);

			return;
		}

		if (data) {
			success('Signed in!');
		}

		refreshSession();
	}

	function refreshSession() {
		supabase.auth.refreshSession().catch((err) => {
			console.error('Error refreshing session:', err.message);
			failure(err.message);
		});
	}

	if (!user && isBrowser()) {
		const token_hash = url.searchParams.get('token_hash');

		if (token_hash) {
			signInWithTokenHash(token_hash);
		}
	}

	return { session, supabase, user };
};
