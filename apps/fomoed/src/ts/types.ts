import type { CryptopanicPost } from '$ts/server/types/api/cryptopanicNews';

export type ClientFetchStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * @deprecated Use Post from common/types instead
 */
export type NewsItem = CryptopanicPost;

export const newsFilterVals = [
	'rising',
	'hot',
	'bullish',
	'bearish',
	'important',
	'saved',
	'lol',
	'all'
] as const;
export type NewsFilterVal = (typeof newsFilterVals)[number];

export const newsKindVals = ['news', 'media', 'all'] as const;
export type NewsKindVal = (typeof newsKindVals)[number];

const planIds = ['plus', 'pro'] as const;
export type PlanId = (typeof planIds)[number];

export type DropdownOption = { value: any; label: string };
export type SocketStatus = 'connecting' | 'connected' | 'disconnected';
