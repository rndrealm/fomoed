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

export function getPointerEventDistance(p1: PointerEvent, p2: PointerEvent) {
	const dx = p1.clientX - p2.clientX;
	const dy = p1.clientY - p2.clientY;

	return Math.sqrt(dx * dx + dy * dy);
}

export function smartRoundPriceStep(step: number) {
	const digits = Math.floor(Math.log10(step));
	const factor = Math.pow(10, digits + 1);

	return Math.ceil(step / factor) * factor;
}

/**
 *
 * @param value
 * @param nChars Minimum 2
 * @returns
 */
export function numberToChars(value: number, nChars: number): string {
	const suffixes = ['', 'k', 'm'];
	let suffixIndex = 0;

	// Scale the number to fit the appropriate suffix
	while (value >= 1000 && suffixIndex < suffixes.length - 1) {
		value /= 1000;
		suffixIndex++;
	}

	const beforeDecimalDigitCount = value.toFixed(0).length;
	const remainingCharCount = nChars - beforeDecimalDigitCount;

	// if more than 4, start's to be buggy
	// 2 for the dot and the suffix
	let afterDecimalDigitCount = Math.min(4, remainingCharCount - 2);

	afterDecimalDigitCount = Math.max(0, afterDecimalDigitCount);

	let formattedValue = value.toFixed(afterDecimalDigitCount);

	// Keep at most one trailing zero
	while (formattedValue.endsWith('0')) {
		formattedValue = formattedValue.slice(0, -1);
	}

	if (formattedValue.includes('.')) {
		formattedValue += '0';
	}

	return formattedValue + suffixes[suffixIndex];
}

export function formatPriceScaleValue(n: number, priceStep: number) {
	const stepDigits = Math.floor(Math.log10(priceStep));

	if (priceStep < 100) {
		return n.toFixed(Math.max(0, -stepDigits));
	}

	if (priceStep < 1000) {
		return (n / 1000).toFixed(2) + 'k';
	}

	return (n / 1000).toFixed(0) + 'k';
}

export function getNextFromArray(array: readonly any[], current: any) {
	const currentIndex = array.indexOf(current);
	const nextIndex = (currentIndex + 1) % array.length;

	return array[nextIndex];
}

export type RGB = { r: number; g: number; b: number };

/**
 * Maps a value from a given range to a color gradient between two RGB colors.
 * @param value - The value to map between 0-1.
 * @param color1 - The starting RGB color.
 * @param color2 - The ending RGB color.
 * @returns The resulting RGB color.
 */
export function mapValueToRgbColor(value: number, color1: RGB, color2: RGB): RGB {
	// Ensure the value is clamped within the range
	// value = Math.max(min, Math.min(max, value));

	// Interpolate each channel
	const r = Math.round(lerp(color1.r, color2.r, value));
	const g = Math.round(lerp(color1.g, color2.g, value));
	const b = Math.round(lerp(color1.b, color2.b, value));

	return { r, g, b };
}

/**
 * Linearly interpolates between two values.
 * @param start - The start value.
 * @param end - The end value.
 * @param t - The interpolation factor (0 to 1).
 * @returns The interpolated value.
 */
function lerp(start: number, end: number, t: number): number {
	return start + t * (end - start);
}

export function rgbToString(rgb: RGB, alpha = 1) {
	return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function rgbArrayToString(rgb: number[], alpha = 1) {
	return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

// Shadcn helper
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
