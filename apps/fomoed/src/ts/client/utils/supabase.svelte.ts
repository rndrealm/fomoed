import { type SupabaseClient } from '@supabase/supabase-js';
import { writable } from 'svelte/store';

export const supabaseStore = writable<SupabaseClient | null>(null);
