import type { IUser, IUserInsert } from '$lib/local';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { error } from '@sveltejs/kit';
import { getServerClient } from './supabase';

export async function getUserByEmail(email: string): Promise<IUser | null> {
	const supabase = getServerClient();

	const user = await supabase.from('users').select().ilike('email', email).limit(1).single();

	return user.data;
}

export async function createOrLinkUserFromOAuth(
	supabase: SupabaseClient,
	user: User
): Promise<void> {
	if (!user.email) {
		error(500, 'User does not have an email address');
	}

	const existingUser = await getUserByEmail(user.email);

	// If the user exists, link the ID from oauth to the existing user
	if (existingUser) {
		linkAuthIdToEmail(user.email, user.id);
		console.info(`Linked email ${user.email} to auth id ${user.id} when loggin in with OAuth.`);
		return;
	}

	// Otherwise insert a new user
	const newUserData: IUserInsert = {
		email: user.email.toLowerCase(),
		username: user.email?.split('@')[0],
		user_id: user.id
	};

	const insertRes = await supabase.from('users').insert(newUserData);

	if (insertRes.error) {
		console.error(insertRes.error);
		error(500, insertRes.error.message);
	}
}

export async function userWithEmailExists(email: string) {
	const supabase = getServerClient();

	const maybeUserWithEmail = await supabase.from('users').select().ilike('email', email);

	if (maybeUserWithEmail.error) {
		throw new Error(maybeUserWithEmail.error.message);
	}

	if (maybeUserWithEmail.data?.length != 0) {
		return true;
	}

	return false;
}

export async function linkAuthIdToEmail(email: string, authId: string) {
	const supabase = getServerClient();

	const updateRes = await supabase
		.from('users')
		.update({ user_id: authId, email: email.toLowerCase() })
		.ilike('email', email);

	if (updateRes.error) {
		throw new Error(`Failed update auth id for email ${email} to id ${authId}`);
	}
}

export async function createUserRow(data: IUserInsert) {
	const supabase = getServerClient();

	data.email = data.email.toLowerCase();

	const insertRes = await supabase.from('users').insert([data]);

	if (insertRes.error) {
		throw new Error('Failed to create new user row. User data: ' + JSON.stringify(data));
	}

	console.info('Created new user record in database. Data: ', JSON.stringify(data));
}
