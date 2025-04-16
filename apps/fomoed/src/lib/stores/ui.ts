import { derived, writable } from 'svelte/store';

export const DESKTOP_BREAKPOINT = 980;

export const mobileMenuOpen = writable(false);
export const displayLogoutPopup = writable(false);
export const innerWidth = writable(null);
export const innerHeight = writable(0);
export const isDesktop = derived(innerWidth, ($innerWidth) =>
	$innerWidth ? $innerWidth >= 980 : null
);
export const isMobile = derived(isDesktop, ($isDesktop) => $isDesktop !== null && !$isDesktop);
export const disableDashboardScroll = writable(false);
