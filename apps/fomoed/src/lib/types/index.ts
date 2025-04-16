export type PlanInfo = {
	planIdPrefix: string;
	name: string;
	recommended: boolean;
	features: string[];

	// The following are fetched from stripe
	priceUsdMonth?: number;
	priceUsdYear?: number;
	priceIdMonth?: string;
	priceIdYear?: string;

	productId?: string;
};

export type SubPlanName = 'pro' | 'plus';
