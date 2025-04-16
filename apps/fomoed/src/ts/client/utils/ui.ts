import { browser } from '$app/environment';
import { Chart } from 'chart.js';
import { encodeToBase64 } from '.';

// TODO move this to utils/client
export async function registerChartPluginZoomInBrowser() {
	if (!browser) return;

	const pluginZoom = await import('chartjs-plugin-zoom');

	Chart.register(pluginZoom.default);
}

/**
 * Returns the appropriate hex color for a given sentiment
 */
export function getSentimentTextColor(sentiment: 'bullish' | 'bearish' | 'neutral'): string {
	return sentiment === 'bullish' ? '#1FC16B' : sentiment === 'bearish' ? '#D00416' : '#6B7280';
}

export function getChangeTextColor(change: number): string {
	return change > 0 ? '#1FC16B' : change < 0 ? '#D00416' : '#6B7280';
}

export function getArticleDetailHref(originalUrl: string): string {
	return `${window.location.origin}/news/${encodeToBase64(originalUrl)}`;
}

// Shadcn helper
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { writable } from 'svelte/store';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
