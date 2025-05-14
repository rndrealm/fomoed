/**
 * Converts a time interval string to milliseconds.
 *
 * @param interval - A string representing a time interval in the format "<number><unit>"
 *                  where unit can be:
 *                  - 'm' for minutes
 *                  - 'h' for hours
 *                  - 'D' for days
 *                  - 'W' for weeks
 *                  - 'M' for months (approximated as 30 days, i.e., 2592000000 milliseconds)
 *
 * @returns The interval converted to milliseconds
 *
 * @throws {Error} If the interval format is invalid or the unit is not recognized
 *
 * @example
 * timeIntervalStringToM('1h')  // returns 3600000 (1 hour in milliseconds)
 * timeIntervalStringToM('24h') // returns 86400000 (24 hours in milliseconds)
 * timeIntervalStringToM('7D')  // returns 604800000 (7 days in milliseconds)
 */
export function timeIntervalStringToMs(interval: string): number {
	const timeMultipliers: { [key: string]: number } = {
		m: 60 * 1000,
		h: 60 * 60 * 1000,
		D: 24 * 60 * 60 * 1000,
		W: 7 * 24 * 60 * 60 * 1000,
		M: 30 * 24 * 60 * 60 * 1000 // Approximation for a month (2592000000 milliseconds)
	};

	const unit = interval.slice(-1);
	const value = parseInt(interval.slice(0, -1), 10);

	if (!timeMultipliers[unit] || isNaN(value)) {
		throw new Error('Invalid interval format');
	}

	return value * timeMultipliers[unit];
}
