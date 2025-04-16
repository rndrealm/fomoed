<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { getContext } from 'svelte';

	const supabase = getContext<SupabaseClient>('supabase');

	function signInWithGoogle() {
		supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: window.location.origin + '/auth/callback'
			}
		});
	}
</script>

<button
	class="flex gap-x-2 h-[54px] font-semibold items-center justify-center text-[#FFFFFFCC] text-opacity-80 text-sm duration-100 px-4 py-2 rounded-[10px] bg-[#17151499] hover:bg-[#FFFFFF26] active:text-[#FFFFFF99] border-[#FFFFFF1A] hover:border-[#FFFFFF4D] border-opacity-10 hover:border-opacity-40 border-[0.5px] w-full"
	on:click={signInWithGoogle}
	type="button"
>
	<img src="/icons/google.svg" alt="Google logo" width={18} height={18} />
	Sign in with Google
</button>
