import type { SubPlanName } from './types';

interface IUserInsert {
	email: string;
	username: string;
	user_id: string;
}

interface IUser extends IUserInsert {
	id: number;
	created_at: string; // ! These will be strings that need to be converted to date
	updated_at: string | null; // ! These will be strings that need to be converted to date
	has_valid_sub: boolean;
	has_had_free_trial: boolean;
	has_trial_active: boolean;
}

interface ISubscription {
	start_timestamp: string; // ! These will be strings that need to be converted to date
	end_timestamp: string; // ! These will be strings that need to be converted to date
	price_id: string;
	subscription_id: string;
	user_id: string;
	created_at: string; // ! These will be strings that need to be converted to date
	updated_at: string | null; // ! These will be strings that need to be converted to date
	has_cancelled: boolean; // ! If user has cancelled, this should not be shown on the UI, but should still take precedence in as far as allowing access is concerned
	// So the above should not be filtered out when subs are being filterred out on the BE and should not prevent the sub button for that price from being clicked
	plan_name: SubPlanName;
}
