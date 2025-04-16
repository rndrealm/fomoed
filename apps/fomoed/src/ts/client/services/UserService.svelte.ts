import { supabaseStore } from '../utils/supabase.svelte';
import type { User } from '@supabase/supabase-js';
import { BaseService } from './BaseService.client.svelte';
import type { PublicUserDataRow } from '$ts/common/db.types';

class UserService extends BaseService {
	authUser: User | null = $state(null);
	publicUserData: PublicUserDataRow | null = $state(null);

	constructor() {
		super();

		supabaseStore.subscribe((supabaseClient) => {
			if (!supabaseClient) {
				return;
			}

			this.refreshUserData();

			supabaseClient.auth.onAuthStateChange((event, session) => {
				if (event === 'SIGNED_IN') {
					this.refreshUserData();
				}

				if (event === 'SIGNED_OUT') {
					this.authUser = null;
				}
			});
		});
	}

	async refreshUserData() {
		const {
			data: { session }
		} = await this.supabase.auth.getSession();

		if (!session) {
			return;
		}

		const { data, error } = await this.supabase.auth.getUser();

		if (error) {
			throw error;
		}

		this.authUser = data.user;

		// Fetch public user data
		const { data: publicUserData, error: userError } = await this.supabase
			.from('public_user_data')
			.select('*')
			.eq('user_id', this.authUser?.id)
			.single();

		if (userError) {
			throw userError;
		}

		this.publicUserData = publicUserData;
	}
}

export const userService = new UserService();
