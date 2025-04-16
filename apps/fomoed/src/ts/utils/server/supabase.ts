import { PRIVATE_SUPABASE_SECRET } from "$env/static/private";
import { PUBLIC_SUPABASE_URL } from "$env/static/public";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export function getServerClient(): SupabaseClient {
	return createServerClient(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SECRET, {
		cookies: {}
	});
}