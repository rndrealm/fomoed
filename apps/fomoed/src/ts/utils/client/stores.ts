import type { Readable } from 'svelte/motion';
import { writable } from 'svelte/store';

export const autoFetchStore = <T>(
	fetchFunction: () => Promise<T>,
	defaultValue: T
): Readable<T> & { fetchData: () => any } => {
	const { subscribe, set } = writable<T>(defaultValue);

	let fetched = false; // Flag to ensure data is only fetched once

	const fetchData = async () => {
		if (!fetched) {
			try {
				const data = await fetchFunction(); // Use the supplied fetch function
				set(data); // Update store with fetched data
				fetched = true; // Mark as fetched
			} catch (error) {
				console.error('Failed to fetch data:', error);
			}
		}
	};

	return {
		subscribe: (...args: any[]) => {
			fetchData();
			return subscribe(...args);
		},
		fetchData
	};
};
