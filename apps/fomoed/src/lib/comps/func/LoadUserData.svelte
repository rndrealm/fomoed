<script lang="ts">
	import { browser } from '$app/environment';
	import { auth_email, auth_user } from '$lib/stores/user';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { getContext } from 'svelte';
	import { get_user } from '$lib';

	const supabase = getContext<SupabaseClient>('supabase');

	auth_email.subscribe(async (email) => {
		if (email) {
			if (browser && supabase) {
				await get_user(supabase);
			}
		} else {
			auth_user.set(null);
		}
	});
</script>
