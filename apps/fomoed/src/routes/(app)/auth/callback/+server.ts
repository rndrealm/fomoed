import { createOrLinkUserFromOAuth } from '$ts/utils/server/user.js';
import { redirect } from '@sveltejs/kit';

export const GET = async (event) => {
	const {
		url,
		locals: { supabase }
	} = event;
	const code = url.searchParams.get('code') as string;
	const next = url.searchParams.get('next') ?? '/';

	if (code) {
		const { error, data } = await supabase.auth.exchangeCodeForSession(code);

		if (!data.user) {
			throw redirect(303, '/auth/auth-code-error');
		}

		createOrLinkUserFromOAuth(supabase, data.user);

		if (!error) {
			throw redirect(303, `/${next.slice(1)}`);
		}
	}

	// return the user to an error page with instructions
	throw redirect(303, '/auth/auth-code-error');
};
