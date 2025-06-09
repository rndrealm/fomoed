import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with the relativeTime plugin for timeAgo functionality
dayjs.extend(relativeTime);

/**
 * Converts an ISO timestamp to a human-readable relative time string
 * @param timestamp ISO timestamp string (e.g., "2023-04-15T14:30:00Z")
 * @returns Human-readable relative time string (e.g., "25 mins ago")
 */
export function timeAgo(timestamp: string): string {
	return dayjs(timestamp).fromNow();
}

/**
 * Converts an ISO timestamp to a format like "March 24"
 * @param timestamp ISO timestamp string (e.g., "2023-04-15T14:30:00Z")
 * @returns Formatted date string (e.g., "April 15")
 */
export function monthDay(timestamp: string): string {
	return dayjs(timestamp).format('MMMM D');
}

/**
 * Encodes a string to base64 (browser-only)
 * @param str The string to encode
 * @returns Base64 encoded string
 */
export function encodeToBase64(str: string): string {
	// Handle Unicode characters properly by using the TextEncoder API
	const encoder = new TextEncoder();
	const bytes = encoder.encode(str);
	return btoa(
		Array.from(bytes)
			.map((byte) => String.fromCharCode(byte))
			.join('')
	);
}

/**
 * Decodes a base64 string to its original form (browser-only)
 * @param base64Str The base64 encoded string to decode
 * @returns Original decoded string
 */
export function decodeFromBase64(base64Str: string): string {
	// Convert base64 to binary string
	const binaryStr = atob(base64Str);

	// Convert to Uint8Array for TextDecoder
	const bytes = new Uint8Array(binaryStr.length);
	for (let i = 0; i < binaryStr.length; i++) {
		bytes[i] = binaryStr.charCodeAt(i);
	}

	// Decode the bytes back to original string using TextDecoder
	const decoder = new TextDecoder();
	return decoder.decode(bytes);
}

/**
 * Function to get the pagination meta data
 * @param page
 * @param limit
 * @returns
 */
export const getPaginationMeta = (page: number, limit: number = 20) => {
	const from = page ? (page - 1) * limit : 0;
	const to = page ? from + limit - 1 : limit - 1;

	return { from, to };
};
