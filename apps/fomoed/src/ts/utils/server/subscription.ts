import type { ISubscription } from '$lib/local';
import type { SubPlanName } from '$lib/types';
import type { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

async function getActiveSubs(supabase: SupabaseClient, userId: string): Promise<ISubscription[]> {
	const { data: subscriptions, error: sub_error }: PostgrestSingleResponse<ISubscription[]> =
		await supabase.from('subscriptions').select().eq('user_id', userId);

	if (sub_error) {
		console.error('Error retrieving subscriptions!');

		return [];
	}

	const activeSubscriptions = subscriptions.filter(
		(sub) => new Date(sub.end_timestamp).getTime() > Date.now()
	);

	return activeSubscriptions;
}

export async function hasActiveSubscription(supabase: SupabaseClient, userId: string) {
	const subs = await getActiveSubs(supabase, userId);

	return subs.length > 0;
}

export async function getActiveSubPlanName(
	supabase: SupabaseClient,
	userId: string
): Promise<SubPlanName | null> {
	// Not sure if a user can have multiple subscriptions,
	// therefore all subscriptions are checked and the highest
	// level is returned.
	const subs = await getActiveSubs(supabase, userId);

	if (subs.find((i) => i.plan_name === 'plus')) {
		return 'plus';
	}

	if (subs.find((i) => i.plan_name === 'pro')) {
		return 'pro';
	}

	return null;
}
