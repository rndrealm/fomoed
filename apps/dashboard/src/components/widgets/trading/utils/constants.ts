export const PERP_MAX_DECIMALS = 6;
export const SPOT_MAX_DECIMALS = 8;

export const MAX_PRICE_SF = 5;

export const isTestnet = process.env.HYPERLIQUID_IS_TESTNET || true;

export const HYPERLIQUID_BASE_URL = isTestnet ? "https://api.hyperliquid-testnet.xyz" : "https://api.hyperliquid.xyz";
