import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { SetOptional } from 'type-fest';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{
				session: SetOptional<Session, 'user'> | null;
				user: User | null;
			}>;
			session: SetOptional<Session, 'user'> | null;
			user: User | null;
			auth_user: IUser & { subscriptions: ISubscription[] };
		}
	}
}

export {};
