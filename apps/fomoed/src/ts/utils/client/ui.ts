import { PUBLIC_UI_ENABLE_XMAS } from '$env/static/public';

export const enableXmas = PUBLIC_UI_ENABLE_XMAS;

export function getDesktopHomepageTopBgUrl() {
	if (enableXmas) {
		return '/background/homepage-1.xmas.webp';
	} else {
		return '/background/homepage-1.webp';
	}
}

export function getMobileHomepageTopBgUrl() {
	if (enableXmas) {
		return '/background/mobile/homepage-top.xmas.webp';
	} else {
		return '/background/mobile/homepage-top.webp';
	}
}

export function getMobileBnbCoinUrl() {
	if (enableXmas) {
		return '/images/xmas/snowflake.blur.png';
	} else {
		return '/images/mobile/bnb-coin-bg.svg';
	}
}

export function getMobileBtcCoinUrl() {
	if (enableXmas) {
		return '/images/xmas/star.png';
	} else {
		return '/images/mobile/btc-coin.svg';
	}
}

export function getMobileSolCoinUrl() {
	if (enableXmas) {
		return '/images/xmas/wreath.png';
	} else {
		return '/images/mobile/sol-coin.svg';
	}
}
