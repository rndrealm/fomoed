import { get } from 'svelte/store';
import { supabaseStore } from '../utils/supabase.svelte';

export class BaseService {
	get supabase() {
		const supabase = get(supabaseStore);

		if (!supabase) {
			throw new Error('Supabase client is not initialized');
		}

		return supabase;
	}
}
