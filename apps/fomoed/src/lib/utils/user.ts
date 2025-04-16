import { displayLogoutPopup, mobileMenuOpen } from '$lib/stores/ui';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function signOut(supabase: SupabaseClient) {
	displayLogoutPopup.set(false);
	mobileMenuOpen.set(false);

	const { error } = await supabase.auth.signOut();
	error && console.log('Auth Action Error: ', error);
}
