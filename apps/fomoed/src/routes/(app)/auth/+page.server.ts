import { getServerClient } from '$ts/utils/server/supabase';
import { createUserRow, userWithEmailExists } from '$ts/utils/server/user';
import { error, redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	// For sign up using email and password
	signup: async ({ request, locals, url }) => {
		const supabase = getServerClient();

		const formData = await request.formData();

		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const username = formData.get('username') as string;

		const genericErrorMsg = 'Registration failed!';

		// if (await authUserWithEmailExists(email)) {
		// 	error(409, "User with this email already exists.");
		// }

		// Supabase will override these details if user with the email
		// laready exists, but their email isn't verified
		const authRes = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${url.protocol}//${url.host}`
			}
		});

		// Supabase returns a fake user object if a user with this email already exists
		// https://github.com/orgs/supabase/discussions/1282#discussioncomment-5230475
		if (
			authRes.data.user &&
			authRes.data.user.identities &&
			authRes.data.user.identities.length === 0
		) {
			error(409, 'User with this email already exists.');
		}

		if (authRes.error) {
			console.error('Failed to create a new supabase user!', error);
			error(500, genericErrorMsg);
		}

		const supabaseUserId = authRes.data.user?.id;

		if (!supabaseUserId) {
			console.error('Did not receive new auth user ID from supabase!');
			error(500, genericErrorMsg);
		}

		// If user row with this email already exists, link the new user id to the existing user
		// This does NOT enable users to create another account for an already registered email
		if (await userWithEmailExists(email)) {
			console.info(`Linking supabase id ${supabaseUserId} to email ${email}`);

			const updateRes = await supabase
				.from('users')
				.update({
					user_id: supabaseUserId,
					username
				})
				.ilike('email', email.toLowerCase());

			if (updateRes.error) {
				console.error('Failed to link new supabase user to existing user!');
				error(500, genericErrorMsg);
			}

			console.info('Linked new auth login to existing user. Email: ', email);
		} else {
			await createUserRow({
				email,
				username,
				user_id: supabaseUserId
			});
		}

		return redirect(303, '/auth/sent/create-account?email=' + email);
	},
	login: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			console.error('Login Error: ', error);

			return {
				success: false,
				action: 'login',
				error: error.message
			};
		}

		return redirect(303, '/');
	},
	forgot: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		const redirectTo = `${url.protocol}//${url.host}`;

		console.log('Redirecting to: ', redirectTo);

		await supabase.auth.resetPasswordForEmail(email, { redirectTo });

		return redirect(303, '/auth/sent/password-reset?email=' + email);
	}
};
