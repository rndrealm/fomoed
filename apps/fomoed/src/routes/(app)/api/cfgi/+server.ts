import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { json, type RequestEvent, error } from '@sveltejs/kit';
import type { CFGIEnum } from '$lib/utils';
import type { ICoinCfgiPriceData, TCoinStatsCoin } from '$lib';
import { CFGI_SUPPORTED_PERIODS_ENUM, cfgi_supported_tokens } from '$lib/utils/cfgi_data';
import { sortBy, uniqBy } from 'lodash-es';
import { PRIVATE_CFGI_KEY } from '$env/static/private';
import { free_tokens } from '$lib/stores';

const endpoint = 'https://cfgi.io/api/api_request.php?api_key=API_KEY&token=TOKEN&period=PERIOD';

function formatDate(date: Date) {
	// Extract year, month, day, hours, minutes, and seconds from the date object
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');

	// Combine the extracted values into the desired format
	const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

	return formattedDate;
}

const maxCfgiIoReturnedDatapoints = 1200;

function getMaxTemporality(start: Date, end: Date): number | null {
	const numSeconds = (end.getTime() - start.getTime()) / 1000;
	const numHours = numSeconds / 3600;

	const num15Mins = numHours / 0.25;
	const num4Hours = numHours / 4;
	const numDays = numHours / 24;

	if (num15Mins <= maxCfgiIoReturnedDatapoints) {
		return 1;
	}

	if (numHours <= maxCfgiIoReturnedDatapoints) {
		return 2;
	}

	if (num4Hours <= maxCfgiIoReturnedDatapoints) {
		return 3;
	}

	if (numDays <= maxCfgiIoReturnedDatapoints) {
		return 4;
	}

	return null;
}

function getMinStartDate(end: Date): number {
	const endTs = end.getTime();
	const startTs = endTs - 1000 * 3600 * 24 * maxCfgiIoReturnedDatapoints;

	return new Date(startTs);
}

async function fetch_cfgi_data(
	token_symbol: string,
	period: CFGI_SUPPORTED_PERIODS_ENUM,
	start: Date | null,
	end: Date | null
) {
	let url = endpoint;

	url = url.replace('API_KEY', PRIVATE_CFGI_KEY);
	url = url.replace('TOKEN', token_symbol);

	if (start && end) {
		// Set the max temporal resolution possible to preserve the requested timeframe.
		// If start and end dates cannot be preserved, update the start date so that maximum duration is visible.

		const temporality = getMaxTemporality(start, end);

		if (temporality === null) {
			start = getMinStartDate(end);
			url = url.replace('PERIOD', 4); // 1 Day temporality
		} else {
			url = url.replace('PERIOD', temporality + '');
		}
	} else {
		// Set temporality requested by the user
		url = url.replace('PERIOD', period.toString());
	}

	if (start) {
		url += '&start=' + formatDate(start);
	}

	if (end) {
		url += '&end=' + formatDate(end);
	}

	if (!start && !end) {
		url += '&values=1200';
	}

	url = encodeURI(url);

	try {
		const res = await fetch(url);
		const resText = await res.text();

		if (resText.toString().length) {
			const data = JSON.parse(resText.toString()) as ICoinCfgiPriceData[];

			return data
				.map((d) => ({ ...d, symbol: token_symbol, cfgi: parseInt(d.cfgi.toString()) }))
				.filter((d) => d.cfgi);
		} else {
			console.error('No CFGI data!');

			return [];
		}
	} catch (err) {
		console.error('Our Error: ', err);

		return [];
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals: { supabase, user } }: RequestEvent) {
	const formData = await request.json();
	const token_symbol = formData.token_symbol;
	const period: CFGI_SUPPORTED_PERIODS_ENUM = formData.period || CFGI_SUPPORTED_PERIODS_ENUM.DAY1;
	const daysBack: number | null = formData.days_back | null;

	const urlString = request.url;
	const url = new URL(urlString);
	const allowDatapointsWithoutPrice =
		url.searchParams.get('allow_datapoints_without_price') === 'true';

	if (!token_symbol) {
		return error(400, { message: 'Bad Request. Missing token_symbol form data field.' });
	}

	// Check subscription
	if (!free_tokens.includes(token_symbol.toUpperCase())) {
		if (!user) {
			return error(401, { message: 'Unauthorized' });
		}
	}

	if (cfgi_supported_tokens.includes(token_symbol.toUpperCase())) {
		let startTimestamp = null;
		let endTimestamp = null;

		if (daysBack) {
			startTimestamp = new Date(Date.now() - daysBack * 24 * 3600 * 1000);
			endTimestamp = new Date();
		}

		const cfgi_data = await fetch_cfgi_data(token_symbol, period, startTimestamp, endTimestamp);

		console.log({ cfgi_data });

		if (cfgi_data.length) {
			const filteredCfgiData = cfgi_data.filter((d) => d?.cfgi);

			const transformedData = filteredCfgiData.map((d) => ({
				...d,
				cfgi: parseInt(d.cfgi.toString()),
				date: new Date(d.date).getTime()
			}));

			let predicate = (d: any) => d.date && d.cfgi && !isNaN(d.cfgi);

			if (!allowDatapointsWithoutPrice) {
				predicate = (d: any) => d.date && d.price && d.cfgi && !isNaN(d.cfgi);
			}

			const validData = transformedData.filter(predicate);

			const sortedData = sortBy(validData, ['date']);

			return json({
				data: sortedData,
				source: 'cfgi.io'
			});
		}
	}

	// Fallback
	// Token History
	const token_historical_price = uniqBy(
		await fetch(`https://api.coin-stats.com/v2/coin_chart/${token_symbol}?type=all`)
			.then((res) => res.json())
			.then(
				(res) =>
					(res?.data?.map((d: number[]) => {
						return {
							date: new Date(new Date(d[0] * 1000).setHours(0, 0, 0, 0)).getTime(),
							price: d[1]
						};
					}) || []) as { date: number; price: number }[]
			)
			.catch(() => []),
		'date'
	);

	// Summarize history by the day
	const cfgi_data = uniqBy(
		await fetch('https://api.coin-stats.com/v2/fear-greed?type=all')
			.then((res) => res.json())
			.then((res) => {
				const data =
					(res?.data as {
						value: number;
						value_classification: CFGIEnum;
						timestamp: number;
						time_until_update: number;
					}[]) || [];

				return data.map((d) => {
					d.timestamp = new Date(
						new Date(parseInt(d.timestamp.toString()) * 1000).setHours(0, 0, 0, 0)
					).getTime();

					return d;
				});
			})
			.catch(() => []),
		'timestamp'
	);

	// History of Tether isn't accurate

	// Combine the data
	return json({
		data: sortBy(
			cfgi_data
				.map((d) => {
					const h_price = token_historical_price.find((p) => p.date === d.timestamp);

					return {
						cfgi: parseInt(d.value.toString()),
						price: d.timestamp && !isNaN(d.timestamp) ? h_price?.price || null : null,
						date: d.timestamp && !isNaN(d.timestamp) ? new Date(d.timestamp).getTime() : 0,
						symbol: token_symbol,
						period
					};
				})
				.filter((d) => d.price && d.date && d.cfgi && !isNaN(d.cfgi)),
			['date']
		),
		soruce: 'coin-stats'
	});
}
