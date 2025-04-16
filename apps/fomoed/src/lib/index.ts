// place files you want to import through the `$lib` alias in this folder.

import type { SupabaseClient } from '@supabase/supabase-js';
import { auth_user } from './stores/user';
import { failure } from './utils';
import type Stripe from 'stripe';

export type CFGI_SYMBOLS =
	| 'BTC'
	| 'ETH'
	| 'BNB'
	| 'XRP'
	| 'SOL'
	| 'ADA'
	| 'LUNA'
	| 'AVAX'
	| 'DOGE'
	| 'DOT'
	| 'SHIB'
	| 'MATIC'
	| 'CRO'
	| 'TRX'
	| 'XLM'
	| 'LINK'
	| 'UNI'
	| 'FTM'
	| 'ALGO'
	| 'MANA'
	| 'LTC'
	| 'LEO'
	| 'FTT'
	| 'NEAR'
	| 'BCH'
	| 'ETC'
	| 'XMR'
	| 'ATOM'
	| 'VET'
	| 'HBAR'
	| 'FLOW'
	| 'ICP'
	| 'APE'
	| 'EGLD'
	| 'XTZ'
	| 'THETA'
	| 'XTZ'
	| 'THETA'
	| 'HNT'
	| 'FIL'
	| 'BSV'
	| 'AXS'
	| 'SAND'
	| 'ZEC'
	| 'EOS'
	| 'IOTA';

export enum PeriodEnum {
	MIN_15 = 1,
	MIN_1HOUR = 2,
	MIN_4HOUR = 3,
	MIN_1DAY = 4
}

export async function fetch_symbol_info(
	symbol: CFGI_SYMBOLS,
	period: PeriodEnum,
	start: Date,
	end: Date
) {}

export type TCoinStatsCoin = {
	c: string; // Color
	i: string;
	ic: string; // Icon
	m: number;
	n: string; // Name
	p1: number; // Price change 1 hours
	p1h: number; // price change 1 hour
	p7: number; // Price change 7 hours
	p7d: number; // Price change 7 days
	p24: number; // Price change 24 hours
	p30: number; // Price change 30
	pb: number;
	pop: number;
	pop24: number;
	pu: number; // Price
	r: number;
	s: string; // Symbol
	v: number; // volume
};

export type ICoinCfgiPriceData = {
	date: number;
	price: number;
	cfgi: number;
	symbol: string;
	period: number;
};

/**
 * Gauge Chart
 * Currency Summary
 * Fear bar chart
 * Fear line chart
 */

export const no_reroute_routes = [
	'/(app)/auth/sent/create-account',
	'/(app)/auth/sent/password-reset',
	'/(app)/auth/error',
	'/(app)/auth/auth-code-error',
	'/(app)/auth/update-password',
	'/(app)/auth',
	'/(app)/dashboard',
	'/(app)/plans',
	'/(app)/(home)',
	'/(share_config)',
	'/(app)/news-old',
	'/(app)/(new-layout)/news',
	'/(app)/(new-layout)/news/[base64originalUrl]',
	'/(app)/components'
];

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function get_user(supabase: SupabaseClient) {
	const res = await fetch(`/api/user`);
	const json = await res.json();

	auth_user.set(json.data);
}
